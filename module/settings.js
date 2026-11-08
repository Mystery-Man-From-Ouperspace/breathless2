export const registerSettings = function() {
    
    // TODO: use this
    // game.settings.register("breathless2", 'enable_storage', {
    //     name: "breathless2.settings.enable_storage.name",
    //     hint: "breathless2.settings.enable_storage.hint",
    //     scope: 'world',
    //     config: true,
    //     type: Boolean,
    //     default: true,
    // });

    game.settings.register("breathless2", "enable_healing", {
        name: "breathless2.settings.enable_healing.name",
        hint: "breathless2.settings.enable_healing.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register("breathless2", "enable_lootcheck", {
        name: "breathless2.settings.enable_lootcheck.name",
        hint: "breathless2.settings.enable_lootcheck.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register("breathless2", "cs_title", {
        name: "breathless2.settings.cs_title.name",
        hint: "breathless2.settings.cs_title.hint",
        scope: "world",
        config: true,
        type: String,
        default: "Character Sheet"
    });

    game.settings.register("breathless2", "job_name", {
        name:"breathless2.settings.job_name.name",
        hint:"breathless2.settings.job_name.hint",
        scope: "world",
        config:true,
        type:String,
        default: "Job"
    });

    game.settings.register("breathless2", "catch_your_breath", {
        name:"breathless2.settings.catch_your_breath.name",
        hint:"breathless2.settings.catch_your_breath.hint",
        scope: "world",
        config:true,
        type:String,
        default: "Catch Your Breath"
    });

    game.settings.register("breathless2", "lay_low", {
        name:"breathless2.settings.lay_low.name",
        hint:"breathless2.settings.lay_low.hint",
        scope: "world",
        config:true,
        type:String,
        default: "Lay Low Awhile"
    });

game.settings.register("breathless2", "loot_table_name", {
        name:"breathless2.settings.loot_table_name.name",
        hint:"breathless2.settings.loot_table_name.hint",
        scope: "world",
        config:true,
        type:String,
        default: "Loot Table"
    });

    game.settings.register("breathless2", "loot_name", {
        name:"breathless2.settings.loot_name.name",
        hint:"breathless2.settings.loot_name.hint",
        scope: "world",
        config:true,
        type:String,
        default: "Loot"
    });

    game.settings.register("breathless2", "grit_name", {
        name:"breathless2.settings.grit_name.name",
        hint:"breathless2.settings.grit_name.hint",
        scope: "world",
        config:true,
        type:String,
        default: "Grit"
    });

    game.settings.register("breathless2", "skill_name", {
        name:"breathless2.settings.skill_name.name",
        hint:"breathless2.settings.skill_name.hint",
        scope: "world",
        config:true,
        type:String,
        default:"Stats"
    });

    game.settings.register("breathless2", "storage_name", {
        name: "breathless2.settings.storage_name.name",
        hint: "breathless2.settings.storage_name.hint",
        scope: "world",
        config: true,
        type: String,
        default: "Backpack"
    });

    game.settings.register("breathless2", "storage_max", {
        name: "breathless2.settings.storage_max.name",
        hint: "breathless2.settings.storage_max.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 3
    });

    game.settings.register("breathless2", "healing_name", {
        name:"breathless2.settings.healing_name.name",
        hint:"breathless2.settings.healing_name.hint",
        scope: "world",
        config:true,
        type:String,
        default:"Safe Rest"
    });

    game.settings.register("breathless2", "stress_name", {
        name: "breathless2.settings.stress_name.name",
        hint: "breathless2.settings.stress_name.hint",
        scope: "World",
        config: true,
        type: String,
        default: "Harm"
    });

    game.settings.register("breathless2", "special_name", {
        name: "breathless2.settings.special_name.name",
        hint: "breathless2.settings.special_name.hint",
        scope: "world",
        config: true,
        type: String,
        default: "Stunt"
    });

    game.settings.register("breathless2", "special_unrolled", {
        name: "breathless2.settings.special_unrolled.name",
        hint: "breathless2.settings.special_unrolled.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });
}