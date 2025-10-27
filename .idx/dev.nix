# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs,... }: {

  # Vilken version av Nix-paketen som ska användas.
  channel = "stable-24.05";

  # Lista över systempaket som ska installeras.
  # Vi installerar ENDAST Node.js v20. INGEN Android-emulator.
  packages = [
    pkgs.nodejs_20
  ];

  # Tillägg (extensions) för kod-editorn.
  idx.extensions =;

  # Konfiguration för förhandsgransknings-fönstret (preview).
  idx.previews = {
    enable = true;
    previews = [
      {
        # Kommando för att starta din utvecklingsserver.
        command = ["npm", "run", "dev"];
        # Namn på förhandsgranskningen.
        id = "web";
        # Etikett i gränssnittet.
        label = "Web";
      }
    ];
  };

  # Kommandon som körs EN GÅNG när miljön skapas första gången.
  idx.onCreate = {
    # Installerar alla dina npm-paket automatiskt.
    install-dependencies = "npm install";
  };
}
