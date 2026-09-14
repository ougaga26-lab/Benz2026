CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`bucket` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`claim_code` text NOT NULL,
	`created_at` text NOT NULL,
	`redeemed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_token_hash_unique` ON `participants` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `participants_claim_code_unique` ON `participants` (`claim_code`);--> statement-breakpoint
CREATE TABLE `stamps` (
	`participant_id` text NOT NULL,
	`station` integer NOT NULL,
	`completed_at` text NOT NULL,
	PRIMARY KEY(`participant_id`, `station`),
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
