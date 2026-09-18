alter table screens
  add column user_agent text,
  add column screen_width integer,
  add column screen_height integer,
  add column device_pixel_ratio real;
