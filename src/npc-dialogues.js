export const npcDialogues = {
  Eldric: {
    start: "welcome",
    nodes: {
      welcome: {
        speaker: "Eldric",
        text: "Selamat datang di desa kami, petualang. Hutan di sebelah timur menyimpan banyak bahaya.",
        choices: [
          {
            text: "Apa yang ada di hutan timur?",
            next: "forest"
          },
          {
            text: "Aku akan berhati-hati.",
            next: "farewell"
          }
        ]
      },
      forest: {
        speaker: "Eldric",
        text: "Hutan itu dipenuhi monster. Persiapkan perlengkapanmu sebelum menjelajah.",
        choices: [
          {
            text: "Terima kasih atas informasinya.",
            next: "farewell"
          }
        ]
      },
      farewell: {
        speaker: "Eldric",
        text: "Semoga perjalananmu aman, petualang.",
        choices: []
      }
    }
  },

  Mira: {
    start: "welcome",
    nodes: {
      welcome: {
        speaker: "Mira",
        text: "Jika kamu menemukan Wood, kumpulkanlah. Bahan itu berguna untuk membuat perlengkapan.",
        choices: [
          {
            text: "Bagaimana cara mengumpulkannya?",
            next: "collect"
          },
          {
            text: "Baik, aku mengerti.",
            next: "farewell"
          }
        ]
      },
      collect: {
        speaker: "Mira",
        text: "Carilah pohon yang bisa dikumpulkan di sekitar hutan. Dekati pohon tersebut untuk berinteraksi.",
        choices: [
          {
            text: "Terima kasih!",
            next: "farewell"
          }
        ]
      },
      farewell: {
        speaker: "Mira",
        text: "Semoga bahan yang kamu kumpulkan bermanfaat!",
        choices: []
      }
    }
  },

  Bram: {
    start: "welcome",
    nodes: {
      welcome: {
        speaker: "Bram",
        text: "Monster berkeliaran di dekat reruntuhan. Pastikan kamu sudah siap sebelum pergi ke sana.",
        choices: [
          {
            text: "Di mana reruntuhannya?",
            next: "ruins"
          },
          {
            text: "Aku akan bersiap.",
            next: "farewell"
          }
        ]
      },
      ruins: {
        speaker: "Bram",
        text: "Carilah area reruntuhan di sekitar desa. Tetap waspada saat menjelajah.",
        choices: [
          {
            text: "Terima kasih.",
            next: "farewell"
          }
        ]
      },
      farewell: {
        speaker: "Bram",
        text: "Jangan meremehkan bahaya di luar desa.",
        choices: []
      }
    }
  },

  Tomas: {
    start: "welcome",
    nodes: {
      welcome: {
        speaker: "Tomas",
        text: "Selamat datang di toko desa! Aku menjual ramuan dan perlengkapan untuk para petualang.",
        choices: [
          {
            text: "Aku ingin melihat barang dagangan.",
            next: "shop"
          },
          {
            text: "Lain kali saja.",
            next: "farewell"
          }
        ]
      },
      shop: {
        speaker: "Tomas",
        text: "Silakan periksa tokoku. Pilih perlengkapan yang sesuai dengan kebutuhanmu.",
        choices: [
          {
            text: "Terima kasih.",
            next: "farewell"
          }
        ]
      },
      farewell: {
        speaker: "Tomas",
        text: "Terima kasih sudah berkunjung!",
        choices: []
      }
    }
  }
};
