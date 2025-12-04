-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'HOME_USER', 'COACH', 'GYM_OWNER');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'COACH', 'GYM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'HOME_USER';
ALTER TABLE "users" ADD COLUMN "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE';
ALTER TABLE "users" ADD COLUMN "subscriptionEnds" TIMESTAMP(3);
