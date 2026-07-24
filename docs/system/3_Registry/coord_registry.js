// system/3_Registry/coord_registry.js

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadJSON(relativePath) {
    const fullPath = path.join(__dirname, relativePath);
    const data = await fs.readFile(fullPath, "utf8");
    const arr = JSON.parse(data);

    // Convert array → dictionary keyed by id
    const dict = {};
    for (const item of arr) {
        dict[item.id] = item;
    }
    return dict;
}

export async function createCoordRegistry() {
    const [
        worldCoords,
        hotelCoords,
        floorCoords,
        roomCoords,
        circulationCoords,
        abstractCoords
    ] = await Promise.all([
        loadJSON("Coordinates/world_coordinates.json"),
        loadJSON("Coordinates/hotel_coordinates.json"),
        loadJSON("Coordinates/floor_coordinates.json"),
        loadJSON("Coordinates/room_coordinates.json"),
        loadJSON("Coordinates/circulation_coordinates.json"),
        loadJSON("Coordinates/abstract_coordinates.json")
    ]);

    return {

        // ------------------------------------------------------------
        // WORLD-PLANE COORDS
        // ------------------------------------------------------------
        "coord_tower": worldCoords["coord_tower"],
        "coord_world_root": worldCoords["coord_world_root"],
        "coord_field": worldCoords["coord_field"],
        "coord_adjacency": worldCoords["coord_adjacency"],
        "coord_invariants": worldCoords["coord_invariants"],
        "coord_collapse": worldCoords["coord_collapse"],

        // ------------------------------------------------------------
        // HOTEL-PLANE COORDS
        // ------------------------------------------------------------
        "coord_hotel_shell": hotelCoords["coord_hotel_shell"],
        "coord_hotel_root": hotelCoords["coord_hotel_root"],
        "coord_lobby": hotelCoords["coord_lobby"],
        "coord_front_desk": hotelCoords["coord_front_desk"],
        "coord_coat_room": hotelCoords["coord_coat_room"],
        "coord_invariants_request": hotelCoords["coord_invariants_request"],
        "coord_runtime_request": hotelCoords["coord_runtime_request"],

        // ------------------------------------------------------------
        // FLOORS (MANUAL)
        // ------------------------------------------------------------
        "coord_floor_01": floorCoords["coord_floor_01"],
        "coord_floor_02": floorCoords["coord_floor_02"],
        "coord_floor_03": floorCoords["coord_floor_03"],
        "coord_service_floor": floorCoords["coord_service_floor"],
        "coord_public_floor": floorCoords["coord_public_floor"],

        // ------------------------------------------------------------
        // CIRCULATION (MANUAL)
        // ------------------------------------------------------------
        "coord_hallway_floor_01": circulationCoords["coord_hallway_floor_01"],
        "coord_hallway_floor_02": circulationCoords["coord_hallway_floor_02"],
        "coord_hallway_floor_03": circulationCoords["coord_hallway_floor_03"],
        "coord_stairwell_01_02": circulationCoords["coord_stairwell_01_02"],
        "coord_stairwell_02_03": circulationCoords["coord_stairwell_02_03"],
        "coord_guest_elevator_01": circulationCoords["coord_guest_elevator_01"],
        "coord_guest_elevator_01_lobby": circulationCoords["coord_guest_elevator_01_lobby"],
        "coord_guest_elevator_03": circulationCoords["coord_guest_elevator_03"],
        "coord_public_elevator_01": circulationCoords["coord_public_elevator_01"],
        "coord_public_elevator_02": circulationCoords["coord_public_elevator_02"],
        "coord_public_corridor": circulationCoords["coord_public_corridor"],
        "coord_service_elevator_01": circulationCoords["coord_service_elevator_01"],
        "coord_service_elevator_00": circulationCoords["coord_service_elevator_00"],
        "coord_service_elevator_b1": circulationCoords["coord_service_elevator_b1"],
        "coord_service_corridor": circulationCoords["coord_service_corridor"],

        // ------------------------------------------------------------
        // SERVICE ROOMS (MANUAL)
        // ------------------------------------------------------------

        "coord_preprocess_service": roomCoords["coord_preprocess_service"],
        "coord_postprocess_service": roomCoords["coord_postprocess_service"],
        "coord_atomize_service": roomCoords["coord_atomize_service"],
        "coord_postprocess_aggregate": roomCoords["coord_postprocess_aggregate"],

        "coord_clean_text": roomCoords["coord_clean_text"],
        "coord_normalize_whitespace": roomCoords["coord_normalize_whitespace"],
        "coord_strip_whitespace": roomCoords["coord_strip_whitespace"],

        "coord_extract_keywords": roomCoords["coord_extract_keywords"],
        "coord_extract_emails": roomCoords["coord_extract_emails"],
        "coord_extract_phone_numbers": roomCoords["coord_extract_phone_numbers"],
        "coord_extract_urls": roomCoords["coord_extract_urls"],
        "coord_extract_dates": roomCoords["coord_extract_dates"],
        "coord_extract_numbers": roomCoords["coord_extract_numbers"],
        "coord_extract_hashtags": roomCoords["coord_extract_hashtags"],
        "coord_extract_mentions": roomCoords["coord_extract_mentions"],
        "coord_extract_code_blocks": roomCoords["coord_extract_code_blocks"],
        "coord_extract_quotes": roomCoords["coord_extract_quotes"],
        "coord_extract_sentences": roomCoords["coord_extract_sentences"],
        "coord_extract_paragraphs": roomCoords["coord_extract_paragraphs"],

        "coord_parse_json": roomCoords["coord_parse_json"],
        "coord_parse_yaml": roomCoords["coord_parse_yaml"],
        "coord_parse_xml": roomCoords["coord_parse_xml"],
        "coord_parse_csv": roomCoords["coord_parse_csv"],
        "coord_parse_ini": roomCoords["coord_parse_ini"],
        "coord_parse_toml": roomCoords["coord_parse_toml"],
        "coord_parse_query_string": roomCoords["coord_parse_query_string"],

        "coord_lowercase_text": roomCoords["coord_lowercase_text"],
        "coord_uppercase_text": roomCoords["coord_uppercase_text"],
        "coord_titlecase_text": roomCoords["coord_titlecase_text"],
        "coord_slugify_text": roomCoords["coord_slugify_text"],
        "coord_tokenize_text": roomCoords["coord_tokenize_text"],
        "coord_detokenize_text": roomCoords["coord_detokenize_text"],
        "coord_sort_lines": roomCoords["coord_sort_lines"],
        "coord_dedupe_lines": roomCoords["coord_dedupe_lines"],

        "coord_generate_text_literal": roomCoords["coord_generate_text_literal"],
        "coord_generate_title": roomCoords["coord_generate_title"],
        "coord_generate_list": roomCoords["coord_generate_list"],
        "coord_generate_bullets": roomCoords["coord_generate_bullets"],
        "coord_generate_outline": roomCoords["coord_generate_outline"],
        "coord_generate_paragraph": roomCoords["coord_generate_paragraph"],
        "coord_generate_description": roomCoords["coord_generate_description"],

        "coord_rewrite_text_literal": roomCoords["coord_rewrite_text_literal"],
        "coord_rewrite_tone": roomCoords["coord_rewrite_tone"],
        "coord_rewrite_structure": roomCoords["coord_rewrite_structure"],
        "coord_rewrite_summary": roomCoords["coord_rewrite_summary"],
        "coord_rewrite_clarity": roomCoords["coord_rewrite_clarity"],
        "coord_rewrite_professionalism": roomCoords["coord_rewrite_professionalism"],

        "coord_tokenize_for_atoms": roomCoords["coord_tokenize_for_atoms"],
        "coord_resolve_atoms": roomCoords["coord_resolve_atoms"],
        "coord_match_phrases": roomCoords["coord_match_phrases"],
        "coord_match_chunks": roomCoords["coord_match_chunks"],
        "coord_normalize_chunks": roomCoords["coord_normalize_chunks"],
        "coord_segment_clauses": roomCoords["coord_segment_clauses"],
        "coord_normalize_clauses": roomCoords["coord_normalize_clauses"],
        "coord_assemble_sentence": roomCoords["coord_assemble_sentence"],
        "coord_collapse_phrases": roomCoords["coord_collapse_phrases"],
        "coord_chunk_builder": roomCoords["coord_chunk_builder"],
        "coord_clause_builder": roomCoords["coord_clause_builder"]
    };
}
