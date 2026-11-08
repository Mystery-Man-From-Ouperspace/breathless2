import { BREATHLESS2 } from "./config.js";

export function registerHandlebarsHelpers() {
  
    // Register handlebar helpers
    Handlebars.registerHelper('select', function (selected, options) { 
        const escapedValue = RegExp.escape(Handlebars.escapeExpression(selected));
        const rgx = new RegExp(' value=[\"\']' + escapedValue + '[\"\']');
        const html = options.fn(this);
        return html.replace(rgx, "$& selected");    
    });

    Handlebars.registerHelper('ife', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('ifnot', function(arg1, arg2, options) {
        return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("times", function(n, content) {
       let result = "";
       if (n==0 || n == null) return;
       for (let i = 0; i < n; i++) {
           result += content.fn(i)
       }
       return result;
    });

    //uppercases; needs work
    Handlebars.registerHelper("proper", function(content) {
        let result = "";
        result = content[0].toUpperCase() + content.substring(1);
        return result;
    });

    Handlebars.registerHelper("minus", function(arg1, arg2) {
        let result = arg1 - arg2;
        return result;
    });

    Handlebars.registerHelper("render", function(arg1){
        return new Handlebars.SafeString(arg1);
    });

    // Checks whether a game setting is active
    Handlebars.registerHelper("getSetting", function(arg){
        if (arg == "" || arg == "non" || arg == undefined) { return ; }
        return game.settings.get('breathless', arg);
    });

    Handlebars.registerHelper("concat", function(...args){
        let result = "";
        for (let a of args) {
            result += a;
        }
        return result;
    });

    Handlebars.registerHelper("getCustomName", function(a) {
        if (a == "none" || a == "None" || a == "") { return; }
        let result = "Name";
        let truncA = a.substring(0,3);
        result = truncA+result;
        return result;
    });

    Handlebars.registerHelper("and", function(a, b){
        return (a && b);
    });

    Handlebars.registerHelper("or", function(a, b){
        return (a || b);
    });

}