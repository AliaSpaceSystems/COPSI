<img src="https://github.com/AliaSpaceSystems/COPSI/blob/master/COPSI_logo_black.svg" width=250>

# The Graphical User Interface for Copernicus Space Components

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## How to cretae a Docker Image of COPSI

1. From COPSI home directory, build the application in production mode

   `ng build -c production --base-href /copsi/`

2. Build the Docker image creating the proper tag
   
   `docker build -t aliaspace/copsi:<tag> .`

3. Open the docker-compose.yml file, update the reference to docker image (if needed), check the mapping of volumes and ports and, finally, run the image with docker-compose

   `docker-compose up -d`