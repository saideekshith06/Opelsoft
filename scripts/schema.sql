-- Opelsoft Relational Schema

-- Users Table
CREATE TABLE IF NOT EXISTS `new_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wp_user_id` INT NULL,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'candidate', -- 'candidate', 'employer', 'admin'
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Candidate Profiles Table
CREATE TABLE IF NOT EXISTS `new_candidate_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `job_title` VARCHAR(255) NULL,
  `phone_number` VARCHAR(50) NULL,
  `minimum_salary` VARCHAR(255) NULL,
  `cover_letter` TEXT NULL,
  `cv_url` VARCHAR(255) NULL,
  `skills` JSON NULL, -- Array of skills and percentages
  `education` JSON NULL, -- Array of education objects
  `experience` JSON NULL, -- Array of experience objects
  `social_links` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_candidate_user` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employer Profiles Table
CREATE TABLE IF NOT EXISTS `new_employer_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(50) NULL,
  `company_address` TEXT NULL,
  `logo_url` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `social_links` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_employer_user` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs Table
CREATE TABLE IF NOT EXISTS `new_jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `wp_job_id` INT NULL,
  `employer_id` INT NULL, -- References new_users.id (employer)
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NULL,
  `requirements` LONGTEXT NULL,
  `job_type` VARCHAR(100) NULL, -- Full-time, Part-time, Internship, Contract, etc.
  `industry` VARCHAR(255) NULL,
  `qualification` VARCHAR(255) NULL,
  `experience` VARCHAR(255) NULL,
  `salary_package` VARCHAR(255) NULL,
  `gender` VARCHAR(50) NULL,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `country` VARCHAR(100) NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `closing_date` DATETIME NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, expired
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_job_employer` FOREIGN KEY (`employer_id`) REFERENCES `new_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job Applications Table
CREATE TABLE IF NOT EXISTS `new_job_applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT NOT NULL,
  `candidate_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'in-progress', -- in-progress, shortlisted, contacted, rejected, selected, hired
  `cv_url` VARCHAR(255) NULL,
  `cover_letter` TEXT NULL,
  `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `new_jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions Table
CREATE TABLE IF NOT EXISTS `new_transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL, -- References new_users.id (who paid)
  `package_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(100) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'completed',
  `listings_granted` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_transaction_user` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Agent Configs Table
CREATE TABLE IF NOT EXISTS `new_ai_agent_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `status` VARCHAR(50) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive'
  `preferred_roles` JSON NULL, -- Array of strings
  `target_locations` JSON NULL, -- Array of strings
  `target_salary` VARCHAR(255) NULL,
  `min_match_score` INT NOT NULL DEFAULT 70,
  `slack_webhook_url` VARCHAR(512) NULL,
  `telegram_chat_id` VARCHAR(100) NULL,
  `discord_webhook_url` VARCHAR(512) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ai_config_user` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Career Sources Table
CREATE TABLE IF NOT EXISTS `new_ai_career_sources` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `url` VARCHAR(512) NOT NULL,
  `source_type` VARCHAR(100) NOT NULL DEFAULT 'career_page', -- 'career_page', 'linkedin', 'yc', 'sheets'
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'unreachable', 'invalid'
  `last_scraped_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ai_source_user` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Discovered Jobs Table
CREATE TABLE IF NOT EXISTS `new_ai_discovered_jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(255) NOT NULL,
  `job_title` VARCHAR(255) NOT NULL,
  `url` VARCHAR(512) NOT NULL UNIQUE,
  `ats_type` VARCHAR(100) NULL, -- 'greenhouse', 'lever', 'ashby', 'workday', 'custom'
  `job_type` VARCHAR(100) NULL, -- 'Full-time', 'Contract', 'Remote', etc.
  `location` VARCHAR(255) NULL,
  `salary` VARCHAR(255) NULL,
  `experience` VARCHAR(255) NULL,
  `skills` JSON NULL, -- Array of required skills
  `description` LONGTEXT NULL,
  `raw_content` LONGTEXT NULL,
  `posting_date` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Matches Table
CREATE TABLE IF NOT EXISTS `new_ai_matches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `discovered_job_id` INT NOT NULL,
  `match_score` INT NOT NULL, -- 0-100
  `recommendation_level` VARCHAR(50) NOT NULL DEFAULT 'low', -- 'strong', 'good', 'low'
  `reasoning_summary` TEXT NULL,
  `risk_factors` JSON NULL, -- Array of strings
  `missing_skills` JSON NULL, -- Array of strings
  `notified` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(50) NOT NULL DEFAULT 'matched', -- 'matched', 'applied', 'rejected'
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ai_match_user` FOREIGN KEY (`user_id`) REFERENCES `new_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_match_job` FOREIGN KEY (`discovered_job_id`) REFERENCES `new_ai_discovered_jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
