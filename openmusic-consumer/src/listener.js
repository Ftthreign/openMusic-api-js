require("dotenv").config();

const amqp = require("amqplib");
const PlaylistsService = require("./PlaylistsService");
const MailSender = require("./mailSender");

const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailSender = MailSender;

  try {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    const queue = "export:playlists";
    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.consume(queue, async (message) => {
      try {
        console.log(
          "Menerima pesan dari RabbitMQ:",
          message.content.toString()
        );
        const { playlistId, targetEmail } = JSON.parse(
          message.content.toString()
        );

        const playlist = await playlistsService.getPlaylistSongs(playlistId);

        if (!playlist) {
          console.error(
            `Playlist dengan ID ${playlistId} tidak ditemukan. Tidak dapat mengekspor.`
          );
          channel.ack(message);
          return;
        }

        const exportData = {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            songs: playlist.songs.map((song) => ({
              id: song.id,
              title: song.title,
              performer: song.performer,
            })),
          },
        };

        await mailSender.sendEmail(
          targetEmail,
          JSON.stringify(exportData, null, 2)
        );

        console.log(
          `Ekspor playlist ${playlistId} ke ${targetEmail} berhasil dikirim.`
        );
        channel.ack(message);
      } catch (error) {
        console.error("Gagal memproses pesan RabbitMQ:", error);
        channel.ack(message);
      }
    });

    console.log(
      "Consumer berjalan. Menunggu pesan di antrian export:playlists..."
    );
  } catch (error) {
    console.error("Gagal terhubung ke RabbitMQ atau memulai consumer:", error);
  }
};

init();
