use std::fs;
use std::sync::mpsc::channel;
use std::time::Duration;
use handlebars::Handlebars;
use serde::Serialize;
use notify::{ Watcher, RecursiveMode, watcher };

#[derive(Serialize)]
struct Config {
    local: bool,
}

struct Builder {
    handlebars: Handlebars,
    config: Config,
}

impl Builder {
    fn new(config: Config) -> Self {
        let mut handlebars = Handlebars::new();
        handlebars.register_partial("base", fs::read_to_string("../content/base.hbs").unwrap()).unwrap();

        Self { handlebars, config }
    }

    fn build(&self, files: &[&'static str]) {
        for filename in files.iter() {
            let sourcename = format!("../content/{}.hbs", filename);
            let contents = fs::read_to_string(sourcename).unwrap();
            match self.handlebars.render_template(&contents, &self.config) {
                Ok(rendered) => fs::write(format!("../rendered/{}.html", filename), rendered).unwrap(),
                Err(err) => println!("{:#?}", err),
            }
        }
    }
}

fn main() {
    let files = [
        "index",
        "about",
        "join",
        "cadre",
        "contact",
        "privacy",
    ];
    let config = Config {
        local: false,
    };

    let builder = Builder::new(config);
    builder.build(&files);

    let (tx, rx) = channel();
    let mut watcher = watcher(tx, Duration::from_secs(1)).unwrap();
    watcher.watch("../content", RecursiveMode::Recursive).unwrap();

    println!("Watching for changes...");

    loop {
        let _ = rx.recv().unwrap();
        print!("Building...");
        builder.build(&files);
        println!("done");
    }
}
