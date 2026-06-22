# Coordinates Registry  
### NoLLM Identity Graph — Coordinate System Overview

This directory defines the **coordinate identity graph** for the NoLLM system.  
Coordinates in NoLLM are **not** a single spatial grid.  
They form a **multi‑plane, typed, hierarchical identity lattice** that the Engine interprets and the World references.

Coordinates define:

- **where** an object is  
- **what** type of object it is  
- **how** it relates to other objects  
- **how** the Engine routes, validates, and interprets it  
- **how** the World anchors it  
- **how** Semantics gives it meaning  

Coordinates are the **identity backbone** of NoLLM.

---

## 1. Coordinate Planes

NoLLM uses **six distinct coordinate planes**, each stored in its own file.

### 1.1 World Coordinates  
**File:** `world_coordinates.json`  
Defines the **macro‑scale world graph**.

Examples:  
- `coord_world_root`  
- `coord_districts`  
- `coord_hotel_root`  
- `coord_tower`  
- `coord_field`

These are the **top‑level anchors** of the entire system.

---

### 1.2 Hotel Coordinates  
**File:** `hotel_coordinates.json`  
Defines the **internal structure of the hotel**.

Examples:  
- `coord_lobby`  
- `coord_front_desk`  
- `coord_district_door`  
- `coord_map_sign`  
- `coord_hotel_shell`

These nodes define the **service layer**, **entry layer**, and **UI layer** of the hotel.

---

### 1.3 Floor Coordinates  
**File:** `floor_coordinates.json`  
Defines the **vertical stack** of the hotel.

Examples:  
- `coord_floor_01`  
- `coord_floor_02`  
- `coord_floor_03`

Each floor is a **coordinate node** with adjacency to the floors above/below.

---

### 1.4 Room Coordinates  
**File:** `room_coordinates.json`  
Defines **room‑level spatial anchors**.

Examples:  
- `coord_guest_room_f01`  
- `coord_llm_room_f01`  
- `coord_bridge_room_f02`  
- `coord_nollm_room_f03`

Rooms inherit their identity from their parent floor coordinate.

---

### 1.5 Circulation Coordinates  
**File:** `circulation_coordinates.json`  
Defines **movement nodes**: hallways, stairs, elevators.

Examples:  
- `coord_hallway_floor_01`  
- `coord_stairwell_01_02`  
- `coord_elevator_core_02`

These nodes define **horizontal** and **vertical** routing.

---

### 1.6 Abstract Coordinates  
**File:** `abstract_coordinates.json`  
Defines **non‑spatial identity spaces**.

Examples:  
- `coord_module_space`  
- `coord_validator_space`  
- `coord_ui_space`  
- `coord_map_style_space`  
- `coord_error_interaction_space`

These nodes represent **logical**, **behavioral**, **UI**, and **error** domains.

---

## 2. Coordinate Structure

All coordinates follow the schema in `coordinate.schema.json`:

