// system/5_Function/coord_postprocess_aggregate.js
//
// This room runs AFTER all generate/rewriter rooms.
// It collects whatever they produced and writes the final output
// into carrier.payload.output so PATH_REVERSE can return it to the UI.

export default function coord_postprocess_aggregate({ workflowContext, carrier }) {

    const hotelRoot = workflowContext["coord_hotel_root"];
    if (!hotelRoot || hotelRoot.phase !== "hotel_root") {
        return {
            phase: "postprocess_aggregate",
            error: "Hotel Root has not run yet",
            metadata_id: null,
            next_path: null,
            carrier
        };
    }

    const metadataId = hotelRoot.metadata_id;

    const postRooms = [
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
        "coord_rewrite_professionalism"
    ];

    let finalText = "";

    for (let i = postRooms.length - 1; i >= 0; i--) {
        const entry = workflowContext[postRooms[i]];
        if (!entry) continue;

        if (typeof entry.result === "string") {
            finalText = entry.result;
            break;
        }
        if (typeof entry.rewritten === "string") {
            finalText = entry.rewritten;
            break;
        }
        if (typeof entry.outline === "string") {
            finalText = entry.outline;
            break;
        }
        if (typeof entry.bullets === "string") {
            finalText = entry.bullets;
            break;
        }
        if (typeof entry.description === "string") {
            finalText = entry.description;
            break;
        }
    }

    carrier.payload = carrier.payload || {};
    carrier.payload.output = finalText;

    return {
        phase: "postprocess_aggregate",
        metadata_id: metadataId,
        next_path: "coord_postprocess_service",
        carrier
    };
}
