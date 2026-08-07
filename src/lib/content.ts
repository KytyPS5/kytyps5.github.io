/* Static content for the KytyPS5 website.
   Every claim below is verified against the repository README (2026-08-07).
   Items the repo does not state are explicitly marked "maintainer input". */

export const NAV_LINKS = [
  { label: "Download", to: "/download" },
  { label: "Compatibility", to: "/compatibility" },
  { label: "Documentation", to: "/docs" },
  { label: "FAQ", to: "/faq" },
  { label: "Contributing", to: "/contributing" },
  { label: "About", to: "/about" },
] as const;

export const PLATFORMS = [
  {
    name: "Windows",
    tag: "Primary",
    icon: "monitor" as const,
    description:
      "The primary platform, receiving the most testing. Requires Windows 10 version 1803 or later and a Vulkan 1.3-capable GPU.",
    requirement: "Windows 10 1803+ · x86-64 · Vulkan 1.3",
  },
  {
    name: "Linux",
    tag: "Supported",
    icon: "terminal" as const,
    description:
      "Builds and runs on current distributions. Configure with CMake and Clang; the bundled SDL2 needs the audio, Wayland and udev dev packages for full features.",
    requirement: "Current Linux distro · x86-64 · Vulkan 1.3",
  },
  {
    name: "macOS",
    tag: "Experimental",
    icon: "laptop" as const,
    description:
      "Experimental support. Builds target x86-64 and run on Apple Silicon under Rosetta 2, with Vulkan provided by the bundled MoltenVK. A small number of titles verified in-game.",
    requirement: "Apple Silicon · Rosetta 2 · MoltenVK",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add game folders",
    description:
      "On first launch, add one or more game folders in the global settings. The launcher searches them recursively for game directories containing eboot.bin.",
  },
  {
    step: "02",
    title: "Pick your game",
    description:
      "Detected games appear in the launcher's game list. Select one and run it — no external low-level emulation modules are required.",
  },
  {
    step: "03",
    title: "Or use the CLI",
    description:
      "Prefer the command line? Start the emulator directly with a legally obtained game directory or ELF file: kyty_emulator --game <path>.",
  },
] as const;

export const FAQS = [
  {
    q: "What games work?",
    a: "KytyPS5 is in an early stage of development. It can boot 2D games and a selection of 3D games, including titles built with Unreal Engine 4/5, Unity and custom engines. Expect crashes, graphical glitches, low compatibility and poor performance — compatibility changes significantly between builds.",
  },
  {
    q: "Is it production ready?",
    a: "No. The project is in an early stage of development. Behavior may change significantly between builds. Development is currently focused on compatibility and boot reliability, not on a polished, playable experience.",
  },
  {
    q: "Which operating systems are supported?",
    a: "Windows is the primary platform and receives the most testing. Linux builds and runs. macOS support is experimental: builds target x86-64 and run on Apple Silicon under Rosetta 2, with Vulkan provided by MoltenVK.",
  },
  {
    q: "Does it require a PS5 BIOS or firmware?",
    a: "No external low-level emulation modules are currently required, and the project does not distribute games or copyrighted system software. Use only game files you have obtained legally.",
  },
  {
    q: "What are the system requirements?",
    a: "A 64-bit x86 processor (on macOS, Apple Silicon with Rosetta 2), a Vulkan 1.3-capable GPU with current drivers, and Windows 10 version 1803+, a current Linux distribution, or macOS on Apple Silicon. On macOS, Vulkan comes from the bundled MoltenVK.",
  },
  {
    q: "How do I build it from source?",
    a: "Clone the repository, initialize submodules (git submodule update --init --recursive), then configure and build with CMake and Ninja using Clang. Qt 6 (Concurrent, Network, Widgets) is required. See the Documentation page for exact commands per platform.",
  },
  {
    q: "Where can I report bugs?",
    a: "Open an issue on GitHub. Search existing issues first, then use the Game Emulation Bug Report template and attach the complete log file. The project is in an early stage, so please be mindful when opening new issues.",
  },
  {
    q: "Is KytyPS5 affiliated with Sony?",
    a: "No. KytyPS5 is not affiliated with Sony Interactive Entertainment or PlayStation. The project does not distribute games or copyrighted system software.",
  },
  {
    q: "What license is it under?",
    a: "KytyPS5 is licensed under the GNU General Public License version 2 (GPL-2.0-only). It is based on the original Kyty project, which was released under the MIT License; Kyty's original copyright and license notice are preserved in the repository.",
  },
  {
    q: "How can I help the project?",
    a: "Testing games and submitting detailed bug reports are the most useful contributions. Code contributions should be focused, build successfully on the platforms they touch, and include relevant tests where practical. See the Contributing page for details.",
  },
] as const;

export const CONTRIBUTOR_GUIDELINES = [
  {
    title: "Test games & file reports",
    description:
      "Testing games and submitting detailed bug reports are useful ways to contribute. Search existing issues first, then use the Game Emulation Bug Report template and attach the complete log file.",
  },
  {
    title: "Code contributions",
    description:
      "Keep changes focused. They should build successfully on the platforms they touch and include relevant tests where practical. Because the project evolves quickly, open an issue before starting a large change.",
  },
  {
    title: "Windows is primary",
    description:
      "A change that alters shared code should not regress Windows, the primary target. Changes confined to a platform's own code paths only need to build there.",
  },
  {
    title: "AI use policy",
    description:
      "AI tools may be used for research and development, but contributors must fully understand, review and test everything they submit. Repository communication must come from the human contributor, and AI-assisted work should be disclosed with the human review performed.",
  },
] as const;

/* ---------- Documentation (verbatim-adapted from the README) ---------- */

export const DOC_SECTIONS = [
  { id: "install", label: "Installation" },
  { id: "build", label: "Building from source" },
  { id: "dependencies", label: "Dependencies" },
  { id: "running", label: "Running" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "contributing", label: "Contributing" },
  { id: "repository", label: "Repository links" },
] as const;

export const BUILD_STEPS = {
  common: [
    "$ git clone https://github.com/KytyPS5/KytyPS5.git",
    "$ cd KytyPS5",
    "$ git submodule update --init --recursive",
  ],
  windows: [
    '# Open an "x64 Native Tools Command Prompt for Visual Studio 2022"',
    "# Configure (replace the Qt path with your installation):",
    'cmake -S . -B _Build/windows -G Ninja -DCMAKE_BUILD_TYPE=Release ^',
    "  -DCMAKE_C_COMPILER=clang-cl -DCMAKE_CXX_COMPILER=clang-cl ^",
    '  -DCMAKE_PREFIX_PATH="C:/Qt/6.x.x/msvc2022_64"',
    "",
    "# Build the launcher and stage a runnable installation:",
    "cmake --build _Build/windows --target launcher",
    "cmake --install _Build/windows --prefix _Build/windows/install",
  ],
  linux: [
    "# Install the toolchain + SDL2 dependencies (Debian/Ubuntu):",
    "sudo apt-get install --no-install-recommends \\",
    "  clang lld ninja-build cmake git glslang-tools \\",
    "  libgl1-mesa-dev libx11-dev libxcursor-dev libxext-dev libxfixes-dev \\",
    "  libxi-dev libxrandr-dev libxss-dev libxkbcommon-dev \\",
    "  libasound2-dev libpulse-dev libudev-dev libdbus-1-dev \\",
    "  libwayland-dev wayland-protocols",
    "",
    "cmake -S . -B _Build/linux -G Ninja -DCMAKE_BUILD_TYPE=Release \\",
    "  -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ \\",
    '  -DCMAKE_PREFIX_PATH="$Qt6_DIR"',
    "",
    "cmake --build _Build/linux --target launcher --parallel",
    "cmake --install _Build/linux --prefix _Build/linux/install",
  ],
  macos: [
    "# Requirements: Apple Silicon + Rosetta 2, Xcode, Homebrew:",
    "brew install cmake ninja glslang",
    "# Qt 6 (Concurrent, Network, Widgets) with x86-64 support",
    "",
    "cmake -S . -B _Build/macos -G Ninja -DCMAKE_BUILD_TYPE=Release \\",
    "  -DCMAKE_OSX_ARCHITECTURES=x86_64 \\",
    "  -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ \\",
    '  -DCMAKE_PREFIX_PATH="$Qt6_DIR"',
    "",
    "cmake --build _Build/macos --target launcher --parallel",
    "cmake --install _Build/macos --prefix _Build/macos/install",
    "# MoltenVK is bundled with release archives",
  ],
} as const;

export const SYSTEM_REQUIREMENTS = [
  "Windows 10 version 1803, a current Linux distribution, or macOS on Apple Silicon",
  "A 64-bit x86 processor (on macOS, an Apple Silicon processor with Rosetta 2)",
  "A Vulkan 1.3-capable GPU with current drivers (on macOS, Vulkan is provided by the bundled MoltenVK)",
] as const;

export const BUILD_REQUIREMENTS = [
  "Git",
  "CMake 3.12 or newer",
  "Ninja",
  "Clang (clang-cl on Windows — the MSVC compiler is not supported)",
  "Qt 6 including Concurrent, Network and Widgets",
  "Submodules: SDL2, Vulkan-Headers, SPIRV-Tools/Headers, VulkanMemoryAllocator, ffmpeg-core, fmt, spdlog, tracy, imgui and more",
] as const;
