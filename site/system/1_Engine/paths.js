// system/1_Engine/paths.js
// Pure coordinate lists. No logic. No semantics.

export const PATH_FORWARD = [
    "coord_tower",
    "coord_world_root",
    "coord_field",
    "coord_world_root",
    "coord_tower",
    "coord_world_root",
    "coord_field",
    "coord_world_root",
    "coord_adjacency",
    "coord_world_root",
    "coord_hotel_shell",
    "coord_hotel_root",
    "coord_lobby",
    "coord_front_desk"
];

export const PATH_REVERSE = [
    "coord_front_desk",
    "coord_lobby",
    "coord_hotel_root",
    "coord_hotel_shell",
    "coord_world_root",
    "coord_tower"
];

export const PATH_PREPROCESS = [
    "coord_clean_text",
    "coord_normalize_whitespace",
    "coord_strip_whitespace",
    "coord_lowercase_text",
    "coord_uppercase_text",
    "coord_titlecase_text",
    "coord_slugify_text",
    "coord_tokenize_text",
    "coord_detokenize_text",
    "coord_sort_lines",
    "coord_dedupe_lines",

    "coord_extract_keywords",
    "coord_extract_emails",
    "coord_extract_phone_numbers",
    "coord_extract_urls",
    "coord_extract_dates",
    "coord_extract_numbers",
    "coord_extract_hashtags",
    "coord_extract_mentions",
    "coord_extract_code_blocks",
    "coord_extract_quotes",
    "coord_extract_sentences",
    "coord_extract_paragraphs",

    "coord_parse_json",
    "coord_parse_yaml",
    "coord_parse_xml",
    "coord_parse_csv",
    "coord_parse_ini",
    "coord_parse_toml",
    "coord_parse_query_string",

    // ⭐ TERMINAL INSTRUCTION (NOT A ROOM)
    { end: "coord_preprocess_service" }
];

export const PATH_POSTPROCESS = [
    "coord_generate_text_literal",
    "coord_generate_title",
    "coord_generate_list",
    "coord_generate_bullets",
    "coord_generate_outline",
    "coord_generate_paragraph",
    "coord_generate_description",

    "coord_rewrite_text_literal",
    "coord_rewrite_tone",
    "coord_rewrite_structure",
    "coord_rewrite_summary",
    "coord_rewrite_clarity",
    "coord_rewrite_professionalism",

    "coord_postprocess_service" // checkpoint
];

export const PATH_ATOMIZE = [
    "coord_tokenize_for_atoms",
    "coord_resolve_atoms",
    "coord_match_phrases",
    "coord_match_chunks",
    "coord_normalize_chunks",
    "coord_segment_clauses",
    "coord_normalize_clauses",
    "coord_assemble_sentence",

    // ⭐ TERMINAL INSTRUCTION (NOT A ROOM)
    { end: "coord_atomize_service" }
];


