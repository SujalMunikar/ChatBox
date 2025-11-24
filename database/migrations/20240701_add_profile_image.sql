CREATE TABLE IF NOT EXISTS `user` (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  image VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

ALTER TABLE `user`
ADD COLUMN IF NOT EXISTS image VARCHAR(255) NULL AFTER email;

-- Update whenever a real upload is available:
UPDATE `user`
SET image = :uploadedImageUrl
WHERE id = :userId;

-- Example for the MySQL terminal:
-- UPDATE `user` SET image = 'https://cdn.example.com/path/to/avatar.png' WHERE id = 1;
