#!/usr/bin/env python3
"""
GamerDrift YouTube Publishing Agent
Automatically fetches the latest uploads from @gamerdrifttube and publishes them to the website.
"""

import os
import re
import ssl
import urllib.request
import xml.etree.ElementTree as ET
import logging
<<<<<<< HEAD
=======
import subprocess
>>>>>>> 3bcf796bb10f60649c536d176df34834b9d264e8
from datetime import datetime

try:
    import requests as _requests_module
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'youtube_agent.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Constants
CHANNEL_ID = "UCBLH4MO6gthbq-o3cOW2_KQ"
RSS_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
# Symmetrical file paths targeting both parent and child directories
base_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(base_dir, '..', 'gamerdrift.github.io', 'index.html')) and os.path.exists(os.path.join(base_dir, '..', 'index.html')):
    root_dir = os.path.abspath(os.path.join(base_dir, '..'))
else:
    root_dir = base_dir

TARGET_FILES = [
    os.path.join(root_dir, "index.html"),
    os.path.join(root_dir, "gamerdrift.github.io", "index.html"),
    os.path.join(root_dir, "gamerdrift.github.io", "remote.html")
]

FALLBACK_VIDEOS = [
    {
        "videoId": "8L7_ZhkxS8U",
        "title": "VALORANT: 1v5 SHIFFT CLUTCH ACE",
        "description": "Raw competitive queue gameplay. Bypassing enemy defense on Bind A-site with clean headshots and dynamic agent utility.",
        "category": "SLAYMORE // VALORANT",
        "telemetry": "K/D: 5.0 // PING: 12 MS\nFPS: 240 // RANK: RADIANT\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "UDRAuKj1R3c",
        "title": "APEX LEGENDS: 20-BOMB SQUAD WIPE",
        "description": "Aggressive drop at Fragment West. Showcasing elite movement, shield swapping, and absolute peacekeeper dominance.",
        "category": "SLAYMORE // APEX LEGENDS",
        "telemetry": "KILLS: 21 // DAMAGE: 4850\nFPS: 144 // SQUAD: CHAMPION\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "QdBZYpR2x-U",
        "title": "GTA VI: VICE CITY ULTRA GRAPHICS DRIFTING",
        "description": "Cinematic drifting through Vice City neon lights. Showing off next-gen vehicle physics and customized tuner handling.",
        "category": "SLAYMORE // GTA VI",
        "telemetry": "SPEED: 145 MPH // ANGLE: 45°\nGRAPHICS: PATH TRACING ON\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "MmB9b5njVbA",
        "title": "MINECRAFT: SPEEDRUN 1.20 CLUTCH PORTAL",
        "description": "Unbelievable luck and routing. Executing sub-10 second nether entry and perfect block placements in the stronghold.",
        "category": "SLAYMORE // MINECRAFT",
        "telemetry": "TIME: 12:44 // SEED: RANDOM\nFPS: 350 // CATEGORY: RSG\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "hB1E-F54R_A",
        "title": "GTA V: ONLINE HEIST ESCAPE SPEEDRUN",
        "description": "Flawless elite challenge completion. Evading 5-star police pursuit using custom escape routes and precision driving.",
        "category": "SLAYMORE // GTA V",
        "telemetry": "PAYOUT: $2.5M // WANTED: 5★\nTIME: 15:12 // DAMAGE: 0%\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "qIcTMpEvV_I",
        "title": "CYBERPUNK 2077: NIGHT CITY DRIVING RUN",
        "description": "Cruising the neon rain-soaked streets in the Quadra Turbo-R V-Tech. Max settings showcase of dense Ray Tracing environments.",
        "category": "SLAYMORE // CYBERPUNK 2077",
        "telemetry": "SPEED: 120 MPH // SYS: OVERDRIVE\nFPS: 90 // DLSS: FRAME GEN ON\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "W2W-tAX03VY",
        "title": "THE LAST OF US PART II: NO DAMAGE RUN",
        "description": "Immersive stealth gameplay on Grounded difficulty. Navigating enemy patrols without alert status or resources lost.",
        "category": "SLAYMORE // THE LAST OF US 2",
        "telemetry": "DIFF: GROUNDED // DAMAGE: 0\nACCURACY: 100% // METHOD: STEALTH\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "PjqsYzBrP-M",
        "title": "SKYRIM: LEVEL 1 TO LEVEL 100 SPEEDRUN",
        "description": "Optimized progression routing and skill book locations. Breaking down character level-up mechanics under speedrun conditions.",
        "category": "SLAYMORE // SKYRIM",
        "telemetry": "LEVEL: 100 // VER: 1.6\nTIME: 2h 14m // GLITCHES: NONE\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "U1K6r_j1v5w",
        "title": "FORZA HORIZON 5: G-FORCE HIGH-OCTANE RUN",
        "description": "Downhill sprint in the Koenigsegg Jesko. Maximizing cornering speed and drifting through volcanic mountain passes.",
        "category": "SLAYMORE // FORZA HORIZON 5",
        "telemetry": "SPEED: 265 MPH // G-FORCE: 3.8G\nCLASS: S2 998 // PERF: RATING 10\nCHANNEL: @GAMERDRIFTTUBE"
    },
    {
        "videoId": "0EGOeqO09lY",
        "title": "CALL OF DUTY WARZONE: TEAM DESTRUCTION",
        "description": "High kill gameplay in Resurgence mode. Synchronized squad maneuvers and dynamic loadout drops for victory.",
        "category": "SLAYMORE // COD WARZONE",
        "telemetry": "KILLS: 28 // PLACEMENT: 1st\nPING: 15 MS // SQUAD: DRIFT\nCHANNEL: @GAMERDRIFTTUBE"
    }
]

def generate_metadata_from_title(title):
    """Generate high-fidelity cyberpunk category and telemetry based on title keywords"""
    title_lower = title.lower()
    
    # Flight Sim / GunShip
    if any(k in title_lower for k in ["gunship", "battle", "aircraft", "demolition", "tomcat", "raptor", "flight", "pilot"]):
        return {
            "category": "SLAYMORE // FLIGHT SIM",
            "telemetry": "SYS: FLIGHT_HEURISTICS\nCOORDS: 42.88 // -78.87\nVESSEL: F-14 TOMCAT // RAPTOR\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Valorant
    elif "valorant" in title_lower:
        return {
            "category": "SLAYMORE // VALORANT",
            "telemetry": "K/D: 5.0 // PING: 12 MS\nFPS: 240 // RANK: RADIANT\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Apex Legends
    elif "apex" in title_lower:
        return {
            "category": "SLAYMORE // APEX LEGENDS",
            "telemetry": "KILLS: 20 // DAMAGE: 4000\nFPS: 144 // SQUAD: CHAMPION\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # GTA / Vice City
    elif "gta" in title_lower or "grand theft auto" in title_lower:
        version = "VI" if "vi" in title_lower else "V"
        return {
            "category": f"SLAYMORE // GTA {version}",
            "telemetry": f"SPEED: 145 MPH // WANTED: 5★\nGRAPHICS: PATH TRACING ON\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Minecraft
    elif "minecraft" in title_lower:
        return {
            "category": "SLAYMORE // MINECRAFT",
            "telemetry": "TIME: 12:44 // SEED: RANDOM\nFPS: 350 // CATEGORY: RSG\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Cyberpunk
    elif "cyberpunk" in title_lower:
        return {
            "category": "SLAYMORE // CYBERPUNK 2077",
            "telemetry": "SPEED: 120 MPH // SYS: OVERDRIVE\nFPS: 90 // DLSS: FRAME GEN ON\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Call of Duty / Warzone
    elif any(k in title_lower for k in ["cod", "warzone", "call of duty"]):
        return {
            "category": "SLAYMORE // COD WARZONE",
            "telemetry": "KILLS: 28 // PLACEMENT: 1st\nPING: 15 MS // SQUAD: DRIFT\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Racing / Forza
    elif any(k in title_lower for k in ["forza", "horizon", "drift", "racing"]):
        return {
            "category": "SLAYMORE // RACING",
            "telemetry": "SPEED: 265 MPH // G-FORCE: 3.8G\nCLASS: S2 998 // PERF: RATING 10\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Skyrim
    elif "skyrim" in title_lower:
        return {
            "category": "SLAYMORE // SKYRIM",
            "telemetry": "LEVEL: 100 // VER: 1.6\nTIME: 2h 14m // GLITCHES: NONE\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Last of Us
    elif "last of us" in title_lower or "tlou" in title_lower:
        return {
            "category": "SLAYMORE // THE LAST OF US 2",
            "telemetry": "DIFF: GROUNDED // DAMAGE: 0\nACCURACY: 100% // METHOD: STEALTH\nCHANNEL: @GAMERDRIFTTUBE"
        }
    # Default Gaming
    else:
        return {
            "category": "SLAYMORE // GAMING",
            "telemetry": "SYS: HYPER_ACTIVE\nFPS: 144 // PING: 15 MS\nRESOLUTION: 4K ULTRA\nCHANNEL: @GAMERDRIFTTUBE"
        }

def _fetch_rss_bytes(url, timeout=15):
    """Fetch RSS bytes via requests (with SSL fallback to urllib)"""
    ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

    # --- Try requests library first ---
    if HAS_REQUESTS:
        try:
            resp = _requests_module.get(url, headers={"User-Agent": ua}, timeout=timeout, verify=True)
            resp.raise_for_status()
            return resp.content
        except Exception as req_err:
            logger.warning(f"requests failed ({req_err}), falling back to urllib")

    # --- Fallback: urllib with certifi certs or unverified context ---
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, headers={"User-Agent": ua})
    with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
        return resp.read()


def fetch_youtube_videos():
    """Fetches the latest videos from the channel's RSS feed"""
    try:
        logger.info(f"Fetching RSS feed from: {RSS_URL}")
        content = _fetch_rss_bytes(RSS_URL)

        root = ET.fromstring(content)
        ns = {
            'atom': 'http://www.w3.org/2005/Atom',
            'yt': 'http://www.youtube.com/xml/schemas/2015',
            'media': 'http://search.yahoo.com/mrss/'
        }
        
        entries = root.findall('atom:entry', ns)
        logger.info(f"Successfully fetched {len(entries)} entries from RSS feed")
        
        videos = []
        for entry in entries:
            video_id = entry.find('yt:videoId', ns).text
            title = entry.find('atom:title', ns).text or "Untitled Video"
            
            # Extract description
            description = ""
            media_group = entry.find('media:group', ns)
            if media_group is not None:
                media_desc = media_group.find('media:description', ns)
                if media_desc is not None:
                    description = media_desc.text or ""
            
            # Clean up description (truncate to first 120 chars and remove excess whitespace/newlines)
            description = re.sub(r'\s+', ' ', description).strip()
            if len(description) > 120:
                description = description[:117] + "..."
            
            meta = generate_metadata_from_title(title)
            
            videos.append({
                "videoId": video_id,
                "title": title,
                "description": description or f"Latest gaming upload from @gamerdrifttube channel.",
                "category": meta["category"],
                "telemetry": meta["telemetry"]
            })
            
        return videos
    except Exception as e:
        logger.error(f"Failed to fetch YouTube videos: {e}")
        return []

def format_js_array(videos):
    """Formats the video dict list as a Javascript array string matching the exact layout style"""
    js_items = []
    for v in videos:
        title = v['title'].replace('"', '\\"').replace('\n', ' ')
        desc = v['description'].replace('"', '\\"').replace('\n', ' ')
        cat = v['category'].replace('"', '\\"')
        telemetry = v['telemetry'].replace('"', '\\"').replace('\n', '\\n')
        
        item = (
            f"    {{\n"
            f'      videoId: "{v["videoId"]}",\n'
            f'      title: "{title}",\n'
            f'      description: "{desc}",\n'
            f'      category: "{cat}",\n'
            f'      telemetry: "{telemetry}"\n'
            f"    }}"
        )
        js_items.append(item)
    return "  const hologramVideosLibrary = [\n" + ",\n".join(js_items) + "\n  ];"

def update_file(file_path, new_array_str):
    """Replaces the hologramVideosLibrary definition in the target file"""
    if not os.path.exists(file_path):
        logger.warning(f"Target file not found: {file_path}")
        return False
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        lines = content.splitlines()
        start_idx = -1
        end_idx = -1
        
        for i, line in enumerate(lines):
            if 'const hologramVideosLibrary = [' in line:
                start_idx = i
            elif start_idx != -1 and line.strip() == '];':
                end_idx = i
                break
                
        if start_idx == -1 or end_idx == -1:
            logger.error(f"Could not find hologramVideosLibrary array in {file_path}")
            return False
            
        # Replace the range of lines
        new_lines = lines[:start_idx] + [new_array_str] + lines[end_idx+1:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines) + '\n')
            
        logger.info(f"Successfully updated {file_path} (replaced lines {start_idx+1} to {end_idx+1})")
        return True
    except Exception as e:
        logger.error(f"Error updating file {file_path}: {e}")
        return False

def run():
    logger.info("Starting GamerDrift YouTube Sync Agent...")
    
    # 1. Fetch latest YouTube videos
    channel_videos = fetch_youtube_videos()
    
    # 2. Build 10-slide library
    final_videos = []
    
    # Add unique fetched videos first
    seen_ids = set()
    for v in channel_videos:
        if v["videoId"] not in seen_ids:
            seen_ids.add(v["videoId"])
            final_videos.append(v)
            
    # Pad with fallback videos if we have fewer than 10
    for fallback in FALLBACK_VIDEOS:
        if len(final_videos) >= 10:
            break
        if fallback["videoId"] not in seen_ids:
            seen_ids.add(fallback["videoId"])
            final_videos.append(fallback)
            
    # Truncate to maximum 10 items
    final_videos = final_videos[:10]
    
    logger.info(f"Final video deck consists of {len(final_videos)} videos")
    for idx, v in enumerate(final_videos):
        logger.info(f"  [{idx+1}] ID: {v['videoId']} | Title: {v['title'][:40]} | Cat: {v['category']}")
        
    # 3. Format as JS array
    new_array_str = format_js_array(final_videos)
    
    # 4. Update all target files
    success_count = 0
    for full_path in TARGET_FILES:
        if update_file(full_path, new_array_str):
            success_count += 1
<<<<<<< HEAD
            
    logger.info(f"YouTube Sync Agent completed. Updated {success_count}/{len(TARGET_FILES)} target files.")

=======
    
    logger.info(f"YouTube Sync Agent completed. Updated {success_count}/{len(TARGET_FILES)} target files.")

    # 5. Auto-commit changes to git
    try:
        repo_dir = os.path.dirname(os.path.abspath(__file__))
        subprocess.run(["git", "-C", repo_dir, "add", "-A"], check=True)
        subprocess.run([
            "git", "-C", repo_dir, "commit", "-m",
            "chore: auto-update YouTube videos via agent"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        subprocess.run(["git", "-C", repo_dir, "push", "origin", "main"], check=True)
        logger.info("Auto-commit & push succeeded.")
    except Exception as git_err:
        logger.error(f"Auto-commit failed: {git_err}")

>>>>>>> 3bcf796bb10f60649c536d176df34834b9d264e8
if __name__ == "__main__":
    run()
