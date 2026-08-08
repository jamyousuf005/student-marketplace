-- Enable Realtime on the messages table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
