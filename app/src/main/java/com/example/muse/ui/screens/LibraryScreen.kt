package com.example.muse.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DownloadDone
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.QueueMusic
import androidx.compose.material.icons.filled.RingVolume
import androidx.compose.material.icons.filled.SpatialTracking
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.muse.model.DownloadedAsset
import com.example.muse.model.PlaylistItem
import com.example.muse.model.Song
import com.example.muse.ui.components.MuseLogo
import com.example.muse.ui.theme.MuseColors

@Composable
fun LibraryScreen(
    playlists: List<PlaylistItem>,
    allSongs: List<Song>,
    favoriteSongIds: Set<String>,
    downloadedAssets: List<DownloadedAsset>,
    onSelectSong: (Song) -> Unit,
    onToggleFavorite: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MuseColors.Background)
            .padding(horizontal = 18.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // Top Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                MuseLogo(size = 32.dp, showWordmark = true, showTagline = true)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "AD-FREE TIER",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = MuseColors.EmeraldGreen
                    )
                }
            }
        }

        // Smart Playlists Section
        item {
            Text(
                text = "Smart Playlists & Curations",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = MuseColors.TextWarmIvory
            )
            Spacer(modifier = Modifier.height(10.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(playlists) { pl ->
                    Column(
                        modifier = Modifier
                            .width(160.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(MuseColors.CardSurface)
                            .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(16.dp))
                            .clickable {
                                val first = allSongs.firstOrNull { pl.songIds.contains(it.id) }
                                if (first != null) onSelectSong(first)
                            }
                            .padding(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(80.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(
                                    brush = Brush.linearGradient(
                                        listOf(Color(pl.gradientColor), MuseColors.SurfaceDark)
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.QueueMusic,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = pl.name,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MuseColors.TextPrimary,
                            maxLines = 1
                        )
                        Text(
                            text = pl.subtitle,
                            fontSize = 10.sp,
                            color = MuseColors.TextSecondary,
                            maxLines = 1
                        )
                    }
                }
            }
        }

        // Liked / Favorites Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Favorites & Catalog",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = MuseColors.TextWarmIvory
                )
                Text(
                    text = "${allSongs.size} Hi-Res Tracks",
                    fontSize = 11.sp,
                    color = MuseColors.PrimaryAccent
                )
            }
        }

        items(allSongs) { song ->
            val isFav = favoriteSongIds.contains(song.id)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(MuseColors.CardSurface)
                    .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(14.dp))
                    .clickable { onSelectSong(song) }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Gradient Artwork Icon
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            brush = Brush.linearGradient(
                                listOf(Color(song.gradientStart), Color(song.gradientEnd))
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = song.title,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MuseColors.TextPrimary
                        )
                        if (song.isDolbyAtmos) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .background(MuseColors.PrimaryAccent, RoundedCornerShape(3.dp))
                                    .padding(horizontal = 4.dp, vertical = 1.dp)
                            ) {
                                Text("DOLBY", fontSize = 8.sp, fontWeight = FontWeight.Black, color = Color.Black)
                            }
                        }
                    }
                    Text(
                        text = "${song.artist} • ${song.durationMs / 60000}:${String.format("%02d", (song.durationMs % 60000) / 1000)}",
                        fontSize = 11.sp,
                        color = MuseColors.TextSecondary
                    )
                }

                IconButton(onClick = { onToggleFavorite(song.id) }) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = "Favorite",
                        tint = if (isFav) MuseColors.RosePink else MuseColors.TextMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }

        // Encrypted Offline Downloads & Extracted Stems Vault
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Lock, contentDescription = null, tint = MuseColors.PrimaryAccent, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Encrypted Offline & Stem Vault",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = MuseColors.TextWarmIvory
                    )
                }
                Text(
                    text = "AES-256",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = MuseColors.EmeraldGreen
                )
            }
        }

        if (downloadedAssets.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(12.dp))
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No extracted stems downloaded yet. Use the BGM explorer to extract BGMs with 1 tap!",
                        fontSize = 11.sp,
                        color = MuseColors.TextSecondary
                    )
                }
            }
        } else {
            items(downloadedAssets) { asset ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(MuseColors.CardSurface)
                        .border(1.dp, MuseColors.CardBorder, RoundedCornerShape(10.dp))
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (asset.type.contains("Ringtone")) Icons.Default.RingVolume else Icons.Default.DownloadDone,
                        contentDescription = null,
                        tint = if (asset.type.contains("Ringtone")) MuseColors.PrimaryAccent else MuseColors.PrimaryAccent,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(asset.title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MuseColors.TextPrimary)
                        Text("${asset.sourceTrack} • ${asset.type} • ${asset.fileSizeMb}MB", fontSize = 10.sp, color = MuseColors.TextSecondary)
                    }
                    Box(
                        modifier = Modifier
                            .background(MuseColors.EmeraldGreen.copy(alpha = 0.2f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text("SAVED", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MuseColors.EmeraldGreen)
                    }
                }
            }
        }
    }
}
