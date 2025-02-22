
-- Create the function for matching transcript segments
create or replace function match_transcript_segments(
  query_text text,
  video_identifier text,
  match_threshold float default 0.5,
  match_count int default 5
) returns table (
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    vt.content,
    1 - (vt.embedding <=> q.embedding) as similarity
  from video_transcripts vt
  cross join (
    select embedding
    from video_transcripts
    where content = query_text
    limit 1
  ) q
  where 
    vt.video_id = video_identifier
    and 1 - (vt.embedding <=> q.embedding) > match_threshold
  order by vt.embedding <=> q.embedding
  limit match_count;
end;
$$;
