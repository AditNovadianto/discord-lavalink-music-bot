function isUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeTrack(track, requestedBy) {
  return {
    encoded: track.encoded,
    info: track.info,
    pluginInfo: track.pluginInfo || {},
    userData: track.userData || {},
    requestedBy,
  };
}

async function searchTracks(node, query, requestedBy) {
  const identifier = isUrl(query) ? query : `ytsearch:${query}`;
  const result = await node.rest.resolve(identifier);

  if (!result || result.loadType === 'empty') {
    return { type: 'empty', tracks: [] };
  }

  if (result.loadType === 'error') {
    throw new Error(result.data?.message || 'Lavalink gagal memuat sumber musik.');
  }

  if (result.loadType === 'track') {
    return {
      type: 'track',
      tracks: [normalizeTrack(result.data, requestedBy)],
    };
  }

  if (result.loadType === 'search') {
    return {
      type: 'search',
      tracks: result.data.slice(0, 1).map((track) =>
        normalizeTrack(track, requestedBy),
      ),
    };
  }

  if (result.loadType === 'playlist') {
    return {
      type: 'playlist',
      playlistInfo: result.data.info,
      tracks: result.data.tracks.map((track) =>
        normalizeTrack(track, requestedBy),
      ),
    };
  }

  return { type: 'empty', tracks: [] };
}

module.exports = { searchTracks };
