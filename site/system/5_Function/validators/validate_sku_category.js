// system/5_Function/validators/validate_sku_category.js

export function validateSKUCategory(skuRegistry, spec, report) {

    for (const sku of Object.values(skuRegistry)) {

        const cat = sku.category;

        // World-plane
        if (sku.plane === "world" && cat !== spec.category.world_plane_category) {
            report.category.ok = false;
            report.category.errors.push(
                `${sku.id} world-plane SKU must use category '${spec.category.world_plane_category}'`
            );
        }

        // Hotel-plane
        if (sku.plane === "hotel" && !spec.category.hotel_plane_categories.includes(cat)) {
            report.category.ok = false;
            report.category.errors.push(
                `${sku.id} hotel-plane SKU must use category in ${JSON.stringify(spec.category.hotel_plane_categories)}`
            );
        }

        // Room-plane
        if (sku.plane === "room" && cat !== spec.category.room_plane_category) {
            report.category.ok = false;
            report.category.errors.push(
                `${sku.id} room-plane SKU must use category '${spec.category.room_plane_category}'`
            );
        }

        // Circulation
        if (sku.plane === "circulation" && cat !== spec.category.circulation_category) {
            report.category.ok = false;
            report.category.errors.push(
                `${sku.id} circulation SKU must use category '${spec.category.circulation_category}'`
            );
        }

        // Module
        if (sku.plane === "module" && cat !== spec.category.module_category) {
            report.category.ok = false;
            report.category.errors.push(
                `${sku.id} module SKU must use category '${spec.category.module_category}'`
            );
        }

        // Validator
        if (sku.plane === "validator" && cat !== spec.category.validator_category) {
            report.category.ok = false;
            report.category.errors.push(
                `${sku.id} validator SKU must use category '${spec.category.validator_category}'`
            );
        }

        // UI categories
        if (sku.plane === "ui" && !spec.category.ui_categories.includes(cat)) {
            report.category.ok = false;
            report.category.errors.push(
                `${sku.id} UI SKU must use one of: ${JSON.stringify(spec.category.ui_categories)}`
            );
        }
    }
}
