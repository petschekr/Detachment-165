use std::fs;
use handlebars::Handlebars;
use serde::Serialize;

#[derive(Serialize)]
struct Config {
    local: bool,
}

fn main() {
    let files = [
        "index"
    ];
    let config = Config {
        local: false,
    };

    let mut handlebars = Handlebars::new();
    handlebars.register_partial("wrapper", fs::read_to_string("../wrapper.hbs").unwrap()).unwrap();

    for filename in files.iter() {
        let sourcename = format!("../{}.hbs", filename);
        let contents = fs::read_to_string(sourcename).unwrap();
        let rendered = handlebars.render_template(&contents, &config).unwrap();
        fs::write(format!("../rendered/{}.html", filename), rendered).unwrap();
    }
}
