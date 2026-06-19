#!/usr/bin/env python3
import sys
import os
import argparse
import time

# ==============================================================================
# ROGUE GHOST 3D: MULTI-AGENT COLLABORATION ORCHESTRATOR
# ==============================================================================

BANNER = """
\033[96m    ____  ____  ________  _______________   ________  ______  ____________
   / __ \/ __ \/ ____/ / / / ____/ ___/ /  / ____/ / / / __ \/ ___/_  __/
  / /_/ / / / / / __/ / / / __/  \__ \/ /  / / __/ /_/ / / / /\__ \ / /   
 / _, _/ /_/ / /_/ / /_/ / /___ ___/ / /__/ /_/ / __  / /_/ /___/ // /    
/_/ |_|\____/\____/\____/_____//____/_____/\____/_/ /_/\____//____//_/     
                    \033[93m[ MULTI-AGENT DEVELOPMENT DECK ]\033[0m
"""

AGENTS = {
    "director": {
        "name": "Game Director",
        "role": "Mission Workflow, Difficulty, Scoring, & Objectives Manager",
        "target": "scripts/mission_manager.gd",
        "description": "Responsible for setting up hostage counts, alert scoring modifiers, extraction zones, and victory conditions."
    },
    "narrative": {
        "name": "Narrative Agent",
        "role": "Story Briefing, Dialogue & Radio Logs Writer",
        "target": "scripts/main_menu.gd",
        "description": "Writes briefings, dynamic player callsigns, stealth alerts dialogues, and hostage gratitude voiceovers."
    },
    "level": {
        "name": "Level Designer",
        "role": "Map Generator, Layout Blocks & Checkpoints Setup",
        "target": "scenes/level_snowblow.tscn",
        "description": "Creates outposts, ventilation paths, corridors, obstacles, and hostage rescue vaults."
    },
    "ai": {
        "name": "Enemy AI Agent",
        "role": "Guard Behavior, Cover Steering, & Patrol Routines",
        "target": "scripts/guard_ai.gd",
        "description": "Implements visual cones, squad alert communication, cover search, and player hunting behaviors."
    },
    "weapon": {
        "name": "Weapon Agent",
        "role": "Guns, Recoil, Fire rates, Sway, & Ballistics Engineer",
        "target": "scripts/player_ghost.gd",
        "description": "Controls vertical recoil drift, bullet drop, silencer attachment status, and fire cooldowns."
    },
    "cinematic": {
        "name": "Cinematic Agent",
        "role": "Cutscenes, Camera pathing, Shake & Screen Transitions",
        "target": "scripts/player_ghost.gd",
        "description": "Sets up intro pan, camera shaking on bullet hits, and death/extraction blackouts."
    },
    "environment": {
        "name": "Environment Agent",
        "role": "Terrain, Lighting, Skyboxes, Weather & Volumetric Fog",
        "target": "scenes/level_snowblow.tscn",
        "description": "Sets colors, fog densities, sand/snow/rain particle triggers, and direct sun positions."
    },
    "optimization": {
        "name": "Optimization Agent",
        "role": "LOD Management, Occlusion Culling, & Performance Profiling",
        "target": "scripts/guard_ai.gd",
        "description": "Configures update ticks, distance-based culling, and removes unused scene components."
    }
}

def print_agents():
    print(BANNER)
    print("\033[92mRegistered Agent Nodes in Subsystems:\033[0m")
    for key, data in AGENTS.items():
        print(f"\n\033[93m[{data['name'].upper()}]\033[0m (ID: {key})")
        print(f"  \033[90mRole:\033[0m   {data['role']}")
        print(f"  \033[90mTarget:\033[0m {data['target']}")
        print(f"  \033[90mFocus:\033[0m  {data['description']}")
    print("\n" + "="*80)

def simulate_agent_work(agent_id, prompt):
    if agent_id not in AGENTS:
        print(f"\033[91mError: Agent '{agent_id}' is not registered.\033[0m")
        return

    agent = AGENTS[agent_id]
    print(BANNER)
    print(f"\033[95m[COMM-LINK]\033[0m Alerting \033[93m{agent['name']}\033[0m...")
    time.sleep(0.5)
    print(f"\033[95m[INSTRUCTION]\033[0m {prompt}")
    print(f"\033[92m[PROCESSING]\033[0m Analyzing target node: \033[96m{agent['target']}\033[0m")
    time.sleep(1.0)
    
    print(f"\033[92m[EXECUTION]\033[0m Applying logic update to the game source...")
    time.sleep(0.5)
    print(f"\033[92m[SUCCESS]\033[0m {agent['name']} successfully compiled updates for \033[96m{agent['target']}\033[0m.")
    print("="*80)

def main():
    parser = argparse.ArgumentParser(description="RogueGhost 3D Multi-Agent Development System")
    parser.add_argument("--list-agents", action="store_true", help="List all registered specialized agents")
    parser.add_argument("--agent", type=str, help="Specify target agent (director|narrative|level|ai|weapon|cinematic|environment|optimization)")
    parser.add_argument("--prompt", type=str, help="Instructions to pass to the target agent")
    
    args = parser.parse_args()

    # If no arguments, print help and list agents
    if len(sys.argv) == 1 or args.list_agents:
        print_agents()
        return

    if args.agent:
        if not args.prompt:
            print("\033[91mError: --prompt is required when invoking an agent.\033[0m")
            return
        simulate_agent_work(args.agent.lower(), args.prompt)

if __name__ == "__main__":
    main()
