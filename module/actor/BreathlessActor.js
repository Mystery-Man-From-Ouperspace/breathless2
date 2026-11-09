export class BreathlessActor extends Actor {
 
    /** @override */
    prepareData() {
        super.prepareData();
    }

    /** @override */
    prepareDerivedData() {
        const actorData = this;
        if (actorData.type == 'pc') {
            this._preparePcData(actorData);
        }
    }

    /** @override */
    getData() {
        const context = super.getData();
        const actorData = this.actor.toObject(false);

        context.system = actorData.system;
        context.flags = actorData.flags;

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        if (actorData.type == 'pc') {
            let charItems = context.items;
            context.skills = charItems.filter(i => i.type === "skill");
            context.gear = charItems.filter(i => i.type === "gear");
        }

        context.healingchoices = [
            {key: "0", label: "breathless2.dialogs.healing.item.zero"},
            {key: "1", label: "breathless2.dialogs.healing.item.one"},
            {key: "2", label: "breathless2.dialogs.healing.item.two"},
            {key: "3", label: "breathless2.dialogs.healing.item.three"}
        ]

        return context;
    }

    /**
     * Prepare Character type specific data
     */
    _preparePcData(actorData) {
        const systemData = actorData.system;

        const count = systemData.stress.states.filter(Boolean).length;
        systemData.stress.value = count;

        if(count >= systemData.stress.max) {
            systemData.stress.vulnerable = true;
        } else {
            systemData.stress.vulnerable = false;
        }
    }

    async rollDice(id) {
        // set some basic variables
        let outcome = "";
        // find the item's current die value, and roll it

        let die;
        let item;
        try {
            item = this.items.get(id);
            die = item.system.current;
        } catch (error) {
            if (id === "loot") {
                die = this.system.loot.current;
            } else {
                die = this.system.grit.current;
            }
        }
        
        // Item is spent, don't roll
        if (die == "--") {
            return;
        }

        // let r = await new Roll("1"+die).evaluate({ async: true });
        let r = new Roll('1'+die);
        await r.roll();

        let result = r.total;

        // step the die value down until reset
        this.stepDown(id, "current");
        
        // determine the level of success
        if (result >= 5) {
            outcome = game.i18n.localize("breathless2.gen.success.full");
        } else if (result < 3) {
            outcome = game.i18n.localize("breathless2.gen.fail");
        } else {
            outcome = game.i18n.localize("breathless2.gen.success.withcost");
        }

        let image = `<img class="flex0" src="systems/breathless2/assets/dice_img/${die}.png" style="border:none" height="48" width="48">`;

        let dialogData = {}
        if (item) {
            dialogData = {
                roll_name: item.name,
                roll_type: item.type,
                roll_object: [r],
                roll_die: die,
                roll_result: result,
                roll_outcome: outcome,
                roll_die_image: image
            }
        } else {
            dialogData = {
                roll_name: id,
                roll_type: "",
                roll_object: [r],
                roll_die: die,
                roll_result: result,
                roll_outcome: outcome,
                roll_die_image: image
            }
        }

       
        this.outputChatMessage(dialogData);        
    }

    async useSpecial() {
        // Allow it to toggle back to an unused state with a simple click
        if (this.system.special.used === true) {
            this.update({"system.special.used":false});
            return;
        }

        if (game.settings.get("breathless2", "special_unrolled")) {
            this.update({"system.special.used":true});
            return;
        } 

        let outcome = "";

        // if NOT used, then roll dice and toggle to "used"
        // let r = await new Roll("1d12").evaluate({ async: true });
        let r = new Roll('1d12');
        await r.roll();

        let result = r.total;
        let die = "d12";

        // determine the level of success
        if (result >= 5) {
            outcome = game.i18n.localize("breathless2.gen.success.full");
        } else if (result < 3) {
            outcome = game.i18n.localize("breathless2.gen.fail");
        } else {
            outcome = game.i18n.localize("breathless2.gen.success.withcost");
        }

        let image = '<img src="systems/breathless2/assets/dice_img/d12.png" style="border:none" height="48" width="48">';

        let dialogData = {
            roll_name: this.system.special.game_name,
            roll_object: [r],
            roll_type: "",
            roll_die: die,
            roll_result: result,
            roll_outcome: outcome,
            roll_die_image: image
        }
       
        this.outputChatMessage(dialogData);
        this.update({"system.special.used":true});
    }

    async useHealing() {
        // allow quick clearing of the toggle without triggering a heal
        if(this.system.healing.used == true) {
            this.update({"system.healing.used":false});
            return;
        }

        let healToggle = this.system.healing.used;
        this.update({"system.healing.used":!healToggle});

        // Render modal dialog
        const myTemplate = 'systems/breathless2/templates/msg/healingdialog.hbs';
        const myTitle = await game.i18n.localize("breathless2.dialogs.healing.title");
        console.log("myTitle", myTitle)

        var myDialogData = {
            nbrHarmsCleared: "0"
        };

        let myDialogOptions;

        const templateData = await foundry.utils.mergeObject(myDialogData, myDialogOptions);

        const myHtml = await foundry.applications.handlebars.renderTemplate(myTemplate, templateData);

        console.log ("myHtml", myHtml)


        // Create the Dialog window
        /*
        console.log("Le dialogue va être affiché")
        // let prompt = await new Promise((resolve) => {
            let d = new Dialog(
                {
                    title: myTitle,
                    content: myHtml,
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-check"></i>',
                            label: game.i18n.localize("breathless2.dialogs.labels.ok"),
                            callback: () => {
                                myDialogData = await _computeResult(myDialogData, myHtml);
                                return myDialogData;
                                }
                        },
                        two: {
                            icon: '<i class="fas fa-cancel"></i>',
                            label: game.i18n.localize("breathless2.dialogs.labels.cancel"),
                            callback: () => { return; }
                        }
                    },
                    default: "two",
                    close: () => { return; }
                }
            );
            d.render(true)
            /*
            d.render(true, {
                width: 520,
                height: "auto"
            }
        ); */

        // this.sheet.render(true);
        // });

        /*
        let healing;
        if (d != null) {
            healing = d.nbrHarmsCleared;
        } else {
            healing = myDialogData.nbrHarmsCleared;
        };

        // toggle down some stress boxes

        let states = this.system.stress.states;
        switch (healing) {
            case "0": {
                break;
            }
            case "1": {
                if (states[4] == true) {
                    states[4] = false;
                } else if (states[3] == true) {
                    states[3] = false;
                } else if (states[2] == true) {
                    states[2] = false;
                } else if (states[1] == true) {
                    states[1] = false;
                } else if (states[0] == true) {
                    states[0] = false;
                };
                break;
            }
            case "2": {
                } else if(states[4] == true && states[3] == true) {
                    states[4] = false;
                    states[3] = false;
                } else if (states[3] == true && states[2] == true) {
                    states[3] = false;
                    states[2] = false;
                } else if (states[2] == true && states[1] == true) {
                    states[2] = false;
                    states[1] = false;
                } else if (states[1] == true && states[0] == true) {
                    states[1] = false;
                    states[0] = false;
                } else if (states[0] == true) {
                    states[0] = false;
                };
                break;
            }
            case "3": {
                if(states[4] == true && states[3] == true && states[2] == true) {
                    states[4] = false;
                    states[3] = false;
                    states[2] = false;
                } else if (states[3] == true && states[2] == true && states[1] == true) {
                    states[3] = false;
                    states[2] = false;
                    states[1] = false;
                } else if (states[2] == true && states[1] == true && states[0] == true) {
                    states[2] = false;
                    states[1] = false;
                    states[0] = false;
                } else if (states[1] == true && states[0] == true) {
                    states[1] = false;
                    states[0] = false;
                } else if (states[0] == true) {
                    states[0] = false;
                };
                break;
            }
            otherwise:;
        }
        this.update({"system.stress.states":states});
        this.sheet.render(true);
        */

        async function _computeResult(myDialogData, myHtml) {
            const editedData = {
                nbrHarmsCleared: await myHtml.find("select[name='healingchoices']").val()
            }
            return editedData;
        }
    }

    stepUp(id, field) {
        let iType;
        let die;
        let item;
        try {
            item = this.items.get(id);
            iType = item.type;
            die = item.system[field];
        } catch (error) {
            iType = id;
            if (id === "loot") {
                die = this.system.loot[field];
            } else {
                die = this.system.grit[field]
            }
        }

        // TODO should this go to D12?
        let stepup = "";
        switch (iType) {
            case "gear": {
                switch (die) {
                    case "d12": {
                        stepup = "d12";
                        break;
                    }
                    case "d10": {
                        stepup = "d12";
                        break;
                    }
                    case "d8": {
                        stepup = "d10";
                        break;
                    }
                    case "d6": {
                        stepup = "d8";
                        break;
                    }
                    case "d4": {
                        stepup = "d6";
                        break;
                    }
                    case "--": 
                    default: {
                        stepup = "d4";
                        break;
                    }
                }
            }; break;
            case "skill": {
                switch (die) {
                    case "d12": {
                        stepup = "d12";
                        break;
                    }
                    case "d10": {
                        stepup = "d12";
                        break;
                    }
                    case "d8": {
                        stepup = "d10";
                        break;
                    }
                    case "d6": {
                        stepup = "d8";
                        break;
                    }
                    case "d4": {
                        stepup = "d6";
                        break;
                    }
                    default: {
                        stepup = "d4";
                        break;
                    }
                }; break;
            }
            case "loot": {
                switch(die) {
                    case "d12": {
                        stepup = "d12";
                        break;
                    }
                    case "d10": {
                        stepup = "d12";
                        break;
                    }
                    case "d8": {
                        stepup = "d10";
                        break;
                    }
                    case "d6": {
                        stepup = "d8";
                        break;
                    }
                    case "d4": {
                        stepup = "d6";
                        break;
                    }
                    default: {
                        stepup = "d4";
                        break;
                    }
                }; break;
            }
            case "grit": {
                switch(die) {
                    case "d12":
                    default: {
                        stepup = "d12";
                        break;
                    }
                }; break;
            }
            default:;
        }

        console.log("stepup", stepup)

        let updateField;

        if (item) {
            updateField = `system.${field}`;
            return item.update({[updateField]:stepup});
        } else {
            switch (iType) {
              case "loot": {updateField = `system.loot.${field}`; return this.update({[updateField]:stepup}); break;};
              case "grit": {updateField = `system.grit.${field}`; return this.update({[updateField]:stepup}); break;};
              default: {return};
            }
        }

        console.log("updateField", updateField)
    }

    stepDown(id, field) {
        let iType;
        let die;
        let item;
        try {
            item = this.items.get(id);
            iType = item.type;
            die = item.system[field];
        } catch (error) {
            iType = id;
            if (id === "loot") {
                die = this.system.loot[field];
            } else {
                die = this.system.grit[field];
            }
        }
        console.log("die", die)

        let stepdown = "";
        console.log("iType", iType)
        switch (iType) {
            case "gear": {
                switch (die) {
                    case "d12": {
                        stepdown = "d10";
                        break;
                    }
                    case "d10": {
                        stepdown = "d8";
                        break;
                    }
                    case "d8": {
                        stepdown = "d6";
                        break;
                    }
                    case "d6": {
                        stepdown = "d4";
                        break;
                    }
                    case "d4":
                    default: {
                        stepdown = "--";
                        break;
                    }
                }; break;
            }
            case "skill": {
                switch(die) {
                    case "d12": {
                        stepdown = "d10";
                        break;
                    }
                    case "d10": {
                        stepdown = "d8";
                        break;
                    }
                    case "d8": {
                        stepdown = "d6";
                        break;
                    }
                    case "d6": {
                        stepdown = "d4";
                        break;
                    }
                    case "d4":
                    default: {
                        stepdown = "d4";
                        break;
                    }
                }; break;
            }
            case "loot": {
                switch(die) {
                    case "d12": {
                        stepdown = "d10";
                        break;
                    }
                    case "d10": {
                        stepdown = "d8";
                        break;
                    }
                    case "d8": {
                        stepdown = "d6"; break;
                        break;
                    }
                    case "d6": {
                        stepdown = "d4";
                        break;
                    }
                    case "d4":
                    default: {
                        stepdown = "--";
                        break;
                    }
                }; break;
            }
            case "grit": {
                switch(die) {
                    case "d12":
                    default: {
                        stepdown = "--";
                        break;
                    }
                }; break;
            }
            default:;
        }

        console.log("stepdown", stepdown)

        let updateField;

        if (item) {
            updateField = `system.${field}`;
            return item.update({[updateField]:stepdown});
        } else {
            switch (iType) {
              case "loot": {updateField = `system.loot.${field}`; return this.update({[updateField]:stepdown}); break;};
              case "grit": {updateField = `system.grit.${field}`; return this.update({[updateField]:stepdown}); break;};
              default: {return};
            }
        }

        console.log("updateField", updateField)
    }

    layLow() {
        let stress = this.system.stress;
        let states = stress.states;
        
        // clear 1 stress
        if(states[3] == true) {
            states[3] = false;
        } else if (states[2] == true) {
            states[2] = false;
        } else if (states[1] == true) {
            states[1] = false;
        } else if (states[0] == true) {
            states[0] = false;
        }
        
        this.update({"system.stress.states":states});
        this.sheet.render(true);

        let pcName = this.name;
        // notify GM that it happened
        ChatMessage.create({
            user:game.user_id,
            rollMode:'gmroll',
            whisper: ChatMessage.getWhisperRecipients("GM"),
            content: game.i18n.format('breathless2.chatMessage.layLowUsed', {pcName: pcName})
        });
    }

    catchBreath() {
        let skills = this.items;
        let special = this.system.special;

        // reset special
        if (special.used == true) {
            this.update({"system.special.used":false});
            this.sheet.render(true);
        }

        // reset all skills to initial levels
        skills.forEach(s => {
            if (s.type != "gear") {
                let init = s.system.initial;
                s.update({"system.current":init});
            }
        });

        let pcName = this.name;
        // notify GM that it happened
        ChatMessage.create({
            user:game.user_id,
            rollMode:'gmroll',
            whisper: ChatMessage.getWhisperRecipients("GM"),
            content: game.i18n.format('breathless2.chatMessage.healUsed', {pcName: pcName})
        });
    }
    
    outputChatMessage(data) {
        console.log("TESTING ---");
        console.log(data.roll_object[0]);
        console.log(data.roll_object);
        let template = 'systems/breathless2/templates/msg/chatmessage.hbs';
        foundry.applications.handlebars.renderTemplate(template, data).then((dlg) => {
            ChatMessage.create({
                user:game.user_id,
                // type:CONST.CHAT_MESSAGE_STYLES.ROLL,
                rolls: data.roll_object,
                speaker: ChatMessage.getSpeaker(),
                content: dlg
            });
        });
    }
}