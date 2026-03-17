import { pgTable, text, timestamp, boolean, integer, serial, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import * as authSchema from "./auth.schema";

// --- Application Schemas ---

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull().default("NexDrak"),
  slug: text("slug").notNull().unique(),
  streamUrl: text("stream_url"),
  coverImageUrl: text("cover_image_url"),
  type: text("type").notNull().default("single"), // 'album' | 'single'
  albumName: text("album_name"),
  releaseDate: timestamp("release_date"),
  trackNumber: integer("track_number"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const streamingLinks = pgTable("streaming_links", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // 'spotify', 'apple_music', etc.
  url: text("url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(), // Keeping as text to match Supabase's YYYY-MM-DD
  time: text("time"),
  location: text("location"),
  venue: text("venue"),
  ticketUrl: text("ticket_url"),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").default(false),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

// --- Relations ---

export const songRelations = relations(songs, ({ many }) => ({
  streamingLinks: many(streamingLinks),
}));

export const streamingLinksRelations = relations(streamingLinks, ({ one }) => ({
  song: one(songs, {
    fields: [streamingLinks.songId],
    references: [songs.id],
  }),
}));

// Export all schemas for Drizzle migrations
export const schema = {
  ...authSchema,
  siteSettings,
  songs,
  streamingLinks,
  events,
  songRelations,
  streamingLinksRelations,
} as const;

// Re-export auth schema for convenience
export * from "./auth.schema";
