
{ pkgs, ... }: {
  # Environment configuration for the web-app template.
  #
  # For more details, see https://developers.google.com/idx/guides/customize-idx-env
  packages = [
    # The following packages are required for the project to function correctly.
    pkgs.nodejs_20
    pkgs.firebase-tools
    pkgs.genkit
  ];
  # Preload the Genkit & Firebase CLIs and login to Firebase.
  preloads = {
    # Check that the tools are available and that the user is logged in.
    # If not, the user will be prompted to login.
    firebase = ''
      firebase --version
      genkit --version
      firebase login --ci --no-localhost
    '';
  };
  # The following scripts are available to run in the terminal.
  scripts.dev.exec = "npm run dev";
}
