import {sqliteTable,text,integer,primaryKey} from 'drizzle-orm/sqlite-core';
export const participants=sqliteTable('participants',{id:text('id').primaryKey(),tokenHash:text('token_hash').notNull().unique(),claimCode:text('claim_code').notNull().unique(),createdAt:text('created_at').notNull(),redeemedAt:text('redeemed_at')});
export const stamps=sqliteTable('stamps',{participantId:text('participant_id').notNull().references(()=>participants.id),station:integer('station').notNull(),completedAt:text('completed_at').notNull()},t=>[primaryKey({columns:[t.participantId,t.station]})]);
export const attempts=sqliteTable('attempts',{id:text('id').primaryKey(),bucket:integer('bucket').notNull(),count:integer('count').notNull()});
