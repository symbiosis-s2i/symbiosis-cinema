{ pkgs }: {
  deps = [
    pkgs.nodejs_22
    pkgs.chromium
    pkgs.nss
    pkgs.freetype
    pkgs.harfbuzz
    pkgs.alsa-lib
    pkgs.xorg.libX11
    pkgs.xorg.libXrandr
    pkgs.xorg.libXinerama
    pkgs.xorg.libXi
    pkgs.xorg.libXext
    pkgs.xorg.libXxf86vm
    pkgs.xorg.libXcursor
    pkgs.libxcb
    pkgs.libxkbcommon
    pkgs.libdrm
    pkgs.mesa
    pkgs.atk
    pkgs.gtk3
    pkgs.glib
    pkgs.dbus
    pkgs.fontconfig
    pkgs.liberation_ttf
  ];
  env = {
    PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
    LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath [
      pkgs.chromium
      pkgs.nss
      pkgs.freetype
      pkgs.harfbuzz
      pkgs.alsa-lib
      pkgs.xorg.libX11
      pkgs.xorg.libXrandr
      pkgs.xorg.libXinerama
      pkgs.xorg.libXi
      pkgs.xorg.libXext
      pkgs.xorg.libXxf86vm
      pkgs.xorg.libXcursor
      pkgs.libxcb
      pkgs.libxkbcommon
      pkgs.libdrm
      pkgs.mesa
      pkgs.atk
      pkgs.gtk3
      pkgs.glib
      pkgs.dbus
      pkgs.fontconfig
    ]}";
  };
}
