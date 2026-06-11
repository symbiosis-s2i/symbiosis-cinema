{ pkgs }: {
  deps = [
    pkgs.nodejs_22
    pkgs.chromium
    pkgs.nspr
    pkgs.nss
    pkgs.freetype
    pkgs.harfbuzz
    pkgs.alsa-lib
    pkgs.glib
    pkgs.gtk3
    pkgs.atk
    pkgs.cups
    pkgs.libdrm
    pkgs.mesa
    pkgs.expat
    pkgs.cairo
    pkgs.pango
    pkgs.xorg.libX11
    pkgs.xorg.libxcb
    pkgs.xorg.libXext
    pkgs.xorg.libXrandr
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXcursor
    pkgs.xorg.libXdamage
    pkgs.xorg.libXfixes
    pkgs.xorg.libXi
    pkgs.xorg.libXrender
    pkgs.xorg.libXtst
  ];
  env = {
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
    PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
  };
}