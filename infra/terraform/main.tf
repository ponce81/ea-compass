# ---------------------------------------------------------------------------
# EA Compass – static hosting on S3 website endpoints (dev + prod) and
# GitHub Actions deploy roles (OIDC, no long-lived keys).
# No CloudFront for now: the sites are plain HTTP S3 website endpoints and
# publicly readable – intended for a mock-data prototype only.
# ---------------------------------------------------------------------------
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.80" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "aws" {
  region = var.region
  default_tags { tags = { Project = "ea-compass", ManagedBy = "terraform" } }
}

variable "region" {
  type    = string
  default = "eu-central-1"
}
variable "github_repo" {
  type        = string
  description = "owner/name of the GitHub repository allowed to deploy"
  default     = "ponce81/ea-compass"
}

locals {
  # dev deploys from pushes to main, prod only from release tags (v*)
  environments = {
    dev  = { subject = "repo:${var.github_repo}:ref:refs/heads/main", operator = "StringEquals" }
    prod = { subject = "repo:${var.github_repo}:ref:refs/tags/v*", operator = "StringLike" }
  }
}

resource "random_id" "suffix" { byte_length = 3 }

# GitHub's OIDC identity provider already exists in this account – reuse it, don't manage it.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# ---------------------------------------------------------------- buckets
resource "aws_s3_bucket" "site" {
  for_each      = local.environments
  bucket        = "ea-compass-${each.key}-${random_id.suffix.hex}"
  force_destroy = true # mock-up: allow `terraform destroy` even when the bucket has files
  tags          = { Environment = each.key }
}

resource "aws_s3_bucket_ownership_controls" "site" {
  for_each = aws_s3_bucket.site
  bucket   = each.value.id
  rule { object_ownership = "BucketOwnerEnforced" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  for_each = aws_s3_bucket.site
  bucket   = each.value.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

# Public read via bucket policy only (ACLs stay blocked).
resource "aws_s3_bucket_public_access_block" "site" {
  for_each                = aws_s3_bucket.site
  bucket                  = each.value.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_read" {
  for_each = aws_s3_bucket.site
  bucket   = each.value.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadForWebsite"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${each.value.arn}/*"
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.site]
}

resource "aws_s3_bucket_website_configuration" "site" {
  for_each = aws_s3_bucket.site
  bucket   = each.value.id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

# ------------------------------------------------------- GitHub deploy roles
resource "aws_iam_role" "deploy" {
  for_each             = local.environments
  name                 = "ea-compass-deploy-${each.key}"
  description          = "GitHub Actions (${var.github_repo}) deploys EA Compass ${each.key}"
  max_session_duration = 3600
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = data.aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      # aud and sub must both be checked; for dev both use StringEquals, so they share one block
      Condition = each.value.operator == "StringEquals" ? {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          "token.actions.githubusercontent.com:sub" = each.value.subject
        }
        } : {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        StringLike   = { "token.actions.githubusercontent.com:sub" = each.value.subject }
      }
    }]
  })
}

# Least privilege: only this environment's bucket.
resource "aws_iam_role_policy" "deploy" {
  for_each = local.environments
  name     = "deploy-to-${each.key}-bucket"
  role     = aws_iam_role.deploy[each.key].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:ListBucket"], Resource = aws_s3_bucket.site[each.key].arn },
      { Effect = "Allow", Action = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"], Resource = "${aws_s3_bucket.site[each.key].arn}/*" }
    ]
  })
}

# ---------------------------------------------------------------- outputs
output "website_urls" {
  value = { for k, w in aws_s3_bucket_website_configuration.site : k => "http://${w.website_endpoint}" }
}
output "buckets" {
  value = { for k, b in aws_s3_bucket.site : k => b.bucket }
}
output "deploy_role_arns" {
  value = { for k, r in aws_iam_role.deploy : k => r.arn }
}
output "region" {
  value = var.region
}
