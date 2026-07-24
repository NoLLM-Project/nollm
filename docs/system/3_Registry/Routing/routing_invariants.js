{
  "identity": {
    "unique_route_ids": true,
    "source_target_reference_canonical_names": true,
    "routes_must_follow_routing_schema": true
  },

  "spatial_routing": {
    "world_to_world_stays_world_plane": true,
    "world_to_hotel_must_pass_through_hotel_shell": true,
    "hotel_to_floor_must_use_valid_hotel_floor_coordinates": true,
    "floor_to_floor_must_follow_vertical_adjacency": true,
    "room_to_hallway_must_follow_adjacency_rules": true,
    "skeletons_not_navigable": true
  },

  "ui_routing": {
    "ui_to_ui_stays_in_ui_space": true,
    "ui_to_surface_must_not_load_scenes": true,
    "ui_to_error_must_not_modify_world_state": true,
    "ui_to_state_machine_must_follow_allowed_transitions": true
  },

  "service_routing": {
    "concierge_routes_only_to_service_behaviors": true,
    "directory_vending_bulletin_route_only_to_their_behaviors": true,
    "service_behaviors_must_not_route_to_world_or_floor_objects": true
  },

  "profiles": {
    "strict_profile_only_dispatches_modules": true,
    "standard_profile_may_navigate_render_or_dispatch": true,
    "service_profile_may_load_scenes_or_apply_anchors": true,
    "ui_profile_may_render_but_not_load_scenes": true,
    "stance_profile_may_apply_anchors_only": true,
    "notepad_profile_may_store_text_only": true,
    "none_profile_must_not_allow_transitions": true
  },

  "transitions": {
    "transitions_literal_non_inferential": true,
    "transitions_must_not_imply_prediction": true,
    "transitions_must_not_imply_inference": true,
    "transitions_must_not_imply_semantic_expansion": true,
    "transitions_must_not_imply_auto_navigation": true,
    "transitions_must_match_profile_allowed_transitions": true
  },

  "integrity": {
    "no_route_may_contradict_adjacency_rules": true,
    "no_route_may_contradict_coordinate_invariants": true,
    "no_route_may_contradict_metadata_or_sku_identity": true,
    "no_route_may_create_cycles_in_world_hotel_floor_room_hierarchy": true,
    "no_route_may_bypass_required_layers": true
  },

  "enforcement": {
    "validate_on_startup": true,
    "validate_on_registry_updates": true,
    "validate_on_world_updates": true,
    "validate_on_scene_transitions": true,
    "reject_on_violation": true
  }
}
