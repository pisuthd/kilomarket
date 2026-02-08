"""
Market data tools for Crypto Market Agent
Provides real-time cryptocurrency market data and analysis with integrated payment system
"""

import json
import time
import logging
from typing import Dict, Any, List
from strands import tool

logger = logging.getLogger(__name__)

# A2A Service Discovery Tools
@tool
def get_available_a2a_services() -> Dict[str, Any]:
    """Get list of available A2A services and their capabilities
    
    Returns:
        Available A2A services with their ports and capabilities
    """
    try:
        from server.a2a_server import get_a2a_manager
        a2a_manager = get_a2a_manager()
        status = a2a_manager.get_status()
        
        services = []
        for server in status.get("servers", []):
            if server.get("running"):
                service_info = {
                    "name": server.get("agent_name", "Unknown Agent"),
                    "port": server.get("port", 0),
                    "description": server.get("description", "A specialized A2A service agent"),
                    "server_url": server.get("server_url"),
                    "capabilities": server.get("capabilities", {}),
                    "business_model": server.get("business_model", "Service"),
                    "has_wallet": server.get("has_wallet", False),
                    "wallet_address": server.get("wallet_address", "")
                }
                services.append(service_info)
        
        return {
            "success": True,
            "services": services,
            "total_services": len(services),
            "message": f"Found {len(services)} available A2A services"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to get A2A services: {str(e)}"
        }

@tool
def get_a2a_service_details(service_name: str) -> Dict[str, Any]:
    """Get detailed information about a specific A2A service
    
    Args:
        service_name: Name of the A2A service
    
    Returns:
        Detailed service information
    """
    try:
        from server.a2a_server import get_a2a_manager
        a2a_manager = get_a2a_manager()
        status = a2a_manager.get_status()
        
        for server in status.get("servers", []):
            if server.get("running") and server.get("agent_name", "").lower() == service_name.lower():
                capabilities = server.get("capabilities", {})
                
                return {
                    "success": True,
                    "service": {
                        "name": server.get("agent_name"),
                        "port": server.get("port"),
                        "description": server.get("description"),
                        "server_url": server.get("server_url"),
                        "services": capabilities.get("services", []),
                        "languages": capabilities.get("languages", []),
                        "specialties": capabilities.get("specialties", []),
                        "features": capabilities.get("features", []),
                        "business_model": server.get("business_model", "Service"),
                        "has_wallet": server.get("has_wallet", False),
                        "wallet_address": server.get("wallet_address", ""),
                        "coverage": capabilities.get("coverage", ""),
                        "data_types": capabilities.get("data_types", [])
                    }
                }
        
        return {
            "success": False,
            "error": f"A2A service '{service_name}' not found or not running"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to get service details: {str(e)}"
        }

# Updated market data based on current CoinMarketCap data
SIMULATED_MARKET_DATA = {
    "cmc20": {
        "symbol": "CMC20",
        "name": "CoinMarketCap 20 Index DTF",
        "price": 142.18,
        "market_cap": 13009090,
        "volume_24h": 7684087,
        "change_1h": 0.19,
        "change_24h": 0.86,
        "change_7d": 12.98,
        "circulating_supply": 54010,
        "rank": 0
    },
    "bitcoin": {
        "symbol": "BTC",
        "name": "Bitcoin",
        "price": 68940.46,
        "market_cap": 1377836675106,
        "volume_24h": 60867332912,
        "change_1h": 0.40,
        "change_24h": 1.31,
        "change_7d": 12.49,
        "circulating_supply": 19980000,
        "rank": 1
    },
    "ethereum": {
        "symbol": "ETH", 
        "name": "Ethereum",
        "price": 2077.87,
        "market_cap": 250784185010,
        "volume_24h": 39852372842,
        "change_1h": 0.48,
        "change_24h": 1.79,
        "change_7d": 15.21,
        "circulating_supply": 120690000,
        "rank": 2
    },
    "tether": {
        "symbol": "USDT",
        "name": "Tether",
        "price": 0.9993,
        "market_cap": 185587839978,
        "volume_24h": 122403041196,
        "change_1h": 0.01,
        "change_24h": 0.02,
        "change_7d": 0.04,
        "circulating_supply": 122480000000,
        "rank": 3
    },
    "bnb": {
        "symbol": "BNB",
        "name": "BNB", 
        "price": 646.23,
        "market_cap": 88120423817,
        "volume_24h": 2180923722,
        "change_1h": 0.12,
        "change_24h": 0.91,
        "change_7d": 17.42,
        "circulating_supply": 3370000,
        "rank": 4
    },
    "xrp": {
        "symbol": "XRP",
        "name": "XRP",
        "price": 1.41,
        "market_cap": 86301589820,
        "volume_24h": 4993340467,
        "change_1h": 0.44,
        "change_24h": 2.41,
        "change_7d": 14.49,
        "circulating_supply": 60910000000,
        "rank": 5
    },
    "usdc": {
        "symbol": "USDC",
        "name": "USDC",
        "price": 0.9998,
        "market_cap": 72699772745,
        "volume_24h": 15758902740,
        "change_1h": 0.00,
        "change_24h": 0.04,
        "change_7d": 0.02,
        "circulating_supply": 15760000000,
        "rank": 6
    },
    "solana": {
        "symbol": "SOL",
        "name": "Solana",
        "price": 87.18,
        "market_cap": 49467840125,
        "volume_24h": 4932209403,
        "change_1h": 0.45,
        "change_24h": 1.04,
        "change_7d": 17.31,
        "circulating_supply": 56740000,
        "rank": 7
    },
    "tron": {
        "symbol": "TRX",
        "name": "TRON",
        "price": 0.2771,
        "market_cap": 26254894385,
        "volume_24h": 743628380,
        "change_1h": 0.33,
        "change_24h": 1.41,
        "change_7d": 3.15,
        "circulating_supply": 94710000000,
        "rank": 8
    },
    "dogecoin": {
        "symbol": "DOGE",
        "name": "Dogecoin",
        "price": 0.09767,
        "market_cap": 16471928383,
        "volume_24h": 1512148831,
        "change_1h": 0.44,
        "change_24h": 0.10,
        "change_7d": 6.60,
        "circulating_supply": 154640000000,
        "rank": 9
    },
    "bitcoin-cash": {
        "symbol": "BCH",
        "name": "Bitcoin Cash",
        "price": 522.52,
        "market_cap": 10446253576,
        "volume_24h": 669416057,
        "change_1h": 0.50,
        "change_24h": 0.52,
        "change_7d": 2.07,
        "circulating_supply": 19990000,
        "rank": 10
    },
    "cardano": {
        "symbol": "ADA",
        "name": "Cardano",
        "price": 0.2709,
        "market_cap": 9769486906,
        "volume_24h": 1257006510,
        "change_1h": 0.02,
        "change_24h": 0.60,
        "change_7d": 8.06,
        "circulating_supply": 4620000000,
        "rank": 11
    },
    "hyperliquid": {
        "symbol": "HYPE",
        "name": "Hyperliquid",
        "price": 31.21,
        "market_cap": 8111330732,
        "volume_24h": 476300448,
        "change_1h": 0.32,
        "change_24h": 2.87,
        "change_7d": 2.35,
        "circulating_supply": 25981000,
        "rank": 12
    },
    "leo": {
        "symbol": "LEO",
        "name": "UNUS SED LEO",
        "price": 7.80,
        "market_cap": 7189684207,
        "volume_24h": 2752083,
        "change_1h": 0.19,
        "change_24h": 2.58,
        "change_7d": 11.30,
        "circulating_supply": 921430000,
        "rank": 13
    },
    "ethena-usde": {
        "symbol": "USDe",
        "name": "Ethena USDe",
        "price": 0.9987,
        "market_cap": 6431950724,
        "volume_24h": 145866185,
        "change_1h": 0.01,
        "change_24h": 0.00,
        "change_7d": 0.02,
        "circulating_supply": 146050000,
        "rank": 14
    },
    "canton": {
        "symbol": "CC",
        "name": "Canton",
        "price": 0.1680,
        "market_cap": 6334394250,
        "volume_24h": 17555502,
        "change_1h": 0.60,
        "change_24h": 3.01,
        "change_7d": 6.13,
        "circulating_supply": 37690000000,
        "rank": 15
    },
    "chainlink": {
        "symbol": "LINK",
        "name": "Chainlink",
        "price": 8.85,
        "market_cap": 6272054177,
        "volume_24h": 890986898,
        "change_1h": 0.27,
        "change_24h": 0.57,
        "change_7d": 11.34,
        "circulating_supply": 70809000,
        "rank": 16
    },
    "monero": {
        "symbol": "XMR",
        "name": "Monero",
        "price": 326.83,
        "market_cap": 6028993448,
        "volume_24h": 89310889,
        "change_1h": 0.52,
        "change_24h": 2.23,
        "change_7d": 29.70,
        "circulating_supply": 18440000,
        "rank": 17
    },
    "dai": {
        "symbol": "DAI",
        "name": "Dai",
        "price": 0.9996,
        "market_cap": 5363744310,
        "volume_24h": 138404354,
        "change_1h": 0.01,
        "change_24h": 0.02,
        "change_7d": 0.01,
        "circulating_supply": 138430000,
        "rank": 18
    },
    "world-liberty-financial-usd1": {
        "symbol": "USD1",
        "name": "World Liberty Financial USD",
        "price": 1.00,
        "market_cap": 5302059680,
        "volume_24h": 1868908685,
        "change_1h": 0.03,
        "change_24h": 0.06,
        "change_7d": 0.13,
        "circulating_supply": 1860000000,
        "rank": 19
    },
    "stellar": {
        "symbol": "XLM",
        "name": "Stellar",
        "price": 0.1612,
        "market_cap": 5273078688,
        "volume_24h": 173419774,
        "change_1h": 0.12,
        "change_24h": 0.44,
        "change_7d": 10.57,
        "circulating_supply": 32700000000,
        "rank": 20
    }
}

@tool
def get_token_price_tool(token_symbol: str, currency: str = "USD") -> Dict[str, Any]:
    """Get current price for a specific cryptocurrency
    
    Args:
        token_symbol: Cryptocurrency symbol (BTC, ETH, etc.)
        currency: Target currency for price (USD, EUR, etc.)
    
    Returns:
        Current price and basic token information
    """
    symbol = token_symbol.lower()
    
    if symbol in SIMULATED_MARKET_DATA:
        data = SIMULATED_MARKET_DATA[symbol]
        
        # Add some realistic price variation
        price_variation = (time.time() % 100) / 10000  # Small variation based on time
        current_price = data["price"] * (1 + price_variation - 0.005)
        
        return {
            "symbol": data["symbol"],
            "name": data["name"],
            "price": round(current_price, 2),
            "currency": currency,
            "change_1h": data.get("change_1h", 0),
            "change_24h": data["change_24h"],
            "change_7d": data.get("change_7d", 0),
            "market_cap": data["market_cap"],
            "volume_24h": data["volume_24h"],
            "circulating_supply": data.get("circulating_supply", 0),
            "rank": data["rank"],
            "last_updated": time.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
    else:
        return {
            "error": f"Token '{token_symbol}' not found in our database",
            "available_tokens": [token["symbol"] for token in SIMULATED_MARKET_DATA.values()]
        }

@tool
def get_market_data_tool(limit: int = 10, sort_by: str = "market_cap") -> List[Dict[str, Any]]:
    """Get market data for top cryptocurrencies
    
    Args:
        limit: Number of top cryptocurrencies to return
        sort_by: Sorting criteria (market_cap, price, volume_24h, change_24h, change_7d)
    
    Returns:
        List of cryptocurrency market data
    """
    # Convert to list for processing
    market_list = list(SIMULATED_MARKET_DATA.values())
    
    # Sort based on criteria
    if sort_by == "market_cap":
        market_list.sort(key=lambda x: x["market_cap"], reverse=True)
    elif sort_by == "price":
        market_list.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "volume_24h":
        market_list.sort(key=lambda x: x["volume_24h"], reverse=True)
    elif sort_by == "change_24h":
        market_list.sort(key=lambda x: x["change_24h"], reverse=True)
    elif sort_by == "change_7d":
        market_list.sort(key=lambda x: x["change_7d"], reverse=True)
    elif sort_by == "change_1h":
        market_list.sort(key=lambda x: x["change_1h"], reverse=True)
    else:
        market_list.sort(key=lambda x: x["rank"])  # Default sort by rank
    
    # Limit results
    limited_data = market_list[:limit]
    
    # Add some realistic variation
    for data in limited_data:
        price_variation = (time.time() % 100) / 10000
        current_price = data["price"] * (1 + price_variation - 0.005)
        data["current_price"] = round(current_price, 2)
        data["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S UTC")
    
    return limited_data

@tool
def get_top_movers_tool(period: str = "24h", limit: int = 5) -> Dict[str, List[Dict[str, Any]]]:
    """Get top gaining and losing cryptocurrencies
    
    Args:
        period: Time period (1h, 24h, 7d)
        limit: Number of top movers to return
    
    Returns:
        Top gainers and losers with their percentage changes
    """
    market_list = list(SIMULATED_MARKET_DATA.values())
    
    # Sort by change based on period
    if period == "1h":
        change_key = "change_1h"
    elif period == "7d":
        change_key = "change_7d"
    else:
        change_key = "change_24h"
    
    gainers = sorted(market_list, key=lambda x: x.get(change_key, 0), reverse=True)[:limit]
    losers = sorted(market_list, key=lambda x: x.get(change_key, 0))[:limit]
    
    # Format results
    def format_mover(data):
        return {
            "symbol": data["symbol"],
            "name": data["name"],
            "price": data["price"],
            "change": data.get(change_key, 0),
            "change_formatted": f"+{data.get(change_key, 0):.2f}%" if data.get(change_key, 0) > 0 else f"{data.get(change_key, 0):.2f}%"
        }
    
    return {
        "period": period,
        "top_gainers": [format_mover(gainer) for gainer in gainers],
        "top_losers": [format_mover(loser) for loser in losers],
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC")
    }

@tool
def get_market_summary_tool() -> Dict[str, Any]:
    """Get comprehensive market summary
    
    Returns:
        Market overview with key metrics and trends
    """
    market_list = list(SIMULATED_MARKET_DATA.values())
    
    # Calculate market stats
    total_market_cap = sum(data["market_cap"] for data in market_list)
    total_volume = sum(data["volume_24h"] for data in market_list)
    
    # Calculate average changes
    avg_change_1h = sum(data.get("change_1h", 0) for data in market_list) / len(market_list)
    avg_change_24h = sum(data["change_24h"] for data in market_list) / len(market_list)
    avg_change_7d = sum(data.get("change_7d", 0) for data in market_list) / len(market_list)
    
    # Find market leaders
    top_by_cap = max(market_list, key=lambda x: x["market_cap"])
    top_volume = max(market_list, key=lambda x: x["volume_24h"])
    
    # Count gainers vs losers for different periods
    gainers_1h = sum(1 for data in market_list if data.get("change_1h", 0) > 0)
    losers_1h = sum(1 for data in market_list if data.get("change_1h", 0) < 0)
    
    gainers_24h = sum(1 for data in market_list if data.get("change_24h", 0) > 0)
    losers_24h = sum(1 for data in market_list if data.get("change_24h", 0) < 0)
    
    gainers_7d = sum(1 for data in market_list if data.get("change_7d", 0) > 0)
    losers_7d = sum(1 for data in market_list if data.get("change_7d", 0) < 0)
    
    # Determine market sentiment
    if avg_change_24h > 2:
        sentiment = "strongly bullish"
    elif avg_change_24h > 0.5:
        sentiment = "bullish"
    elif avg_change_24h < -2:
        sentiment = "strongly bearish"
    elif avg_change_24h < -0.5:
        sentiment = "bearish"
    else:
        sentiment = "neutral"
    
    return {
        "market_overview": {
            "total_market_cap": total_market_cap,
            "total_volume_24h": total_volume,
            "average_change_1h": round(avg_change_1h, 2),
            "average_change_24h": round(avg_change_24h, 2),
            "average_change_7d": round(avg_change_7d, 2),
            "market_sentiment": sentiment
        },
        "market_leaders": {
            "largest_by_market_cap": {
                "symbol": top_by_cap["symbol"],
                "name": top_by_cap["name"],
                "market_cap": top_by_cap["market_cap"],
                "price": top_by_cap["price"]
            },
            "highest_volume": {
                "symbol": top_volume["symbol"], 
                "name": top_volume["name"],
                "volume_24h": top_volume["volume_24h"],
                "price": top_volume["price"]
            }
        },
        "market_breadth": {
            "total_cryptocurrencies": len(market_list),
            "gainers_1h": gainers_1h,
            "losers_1h": losers_1h,
            "gainers_24h": gainers_24h,
            "losers_24h": losers_24h,
            "gainers_7d": gainers_7d,
            "losers_7d": losers_7d
        },
        "top_performers": {
            "best_1h": max(market_list, key=lambda x: x.get("change_1h", -999))["symbol"],
            "best_24h": max(market_list, key=lambda x: x["change_24h"])["symbol"],
            "best_7d": max(market_list, key=lambda x: x.get("change_7d", -999))["symbol"],
            "worst_1h": min(market_list, key=lambda x: x.get("change_1h", 999))["symbol"],
            "worst_24h": min(market_list, key=lambda x: x["change_24h"])["symbol"],
            "worst_7d": min(market_list, key=lambda x: x.get("change_7d", 999))["symbol"]
        },
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "data_source": "KiloMarket Crypto Agent (Updated Market Data)"
    }

@tool
def get_detailed_token_info_tool(token_symbol: str) -> Dict[str, Any]:
    """Get detailed information about a specific cryptocurrency
    
    Args:
        token_symbol: Cryptocurrency symbol (BTC, ETH, etc.)
    
    Returns:
        Comprehensive token information including all available metrics
    """
    symbol = token_symbol.lower()
    
    if symbol in SIMULATED_MARKET_DATA:
        data = SIMULATED_MARKET_DATA[symbol]
        
        # Calculate additional metrics
        price_variation = (time.time() % 100) / 10000
        current_price = data["price"] * (1 + price_variation - 0.005)
        
        # Calculate market cap to volume ratio
        mcap_to_volume_ratio = data["market_cap"] / data["volume_24h"] if data["volume_24h"] > 0 else 0
        
        # Calculate fully diluted valuation if circulating supply is available
        fdv = current_price * data.get("circulating_supply", 0) if data.get("circulating_supply") else data["market_cap"]
        
        return {
            "symbol": data["symbol"],
            "name": data["name"],
            "current_price": round(current_price, 2),
            "market_cap": data["market_cap"],
            "fully_diluted_valuation": fdv,
            "volume_24h": data["volume_24h"],
            "circulating_supply": data.get("circulating_supply"),
            "total_supply": data.get("circulating_supply"),  # Using circulating as total
            "max_supply": data.get("circulating_supply"),  # Using circulating as max
            "price_changes": {
                "1h": data.get("change_1h", 0),
                "24h": data["change_24h"],
                "7d": data.get("change_7d", 0)
            },
            "market_metrics": {
                "market_cap_rank": data["rank"],
                "market_cap_to_volume_ratio": round(mcap_to_volume_ratio, 2),
                "volume_rank": sorted(SIMULATED_MARKET_DATA.values(), key=lambda x: x["volume_24h"], reverse=True).index(data) + 1
            },
            "performance_indicators": {
                "is_gainer_1h": data.get("change_1h", 0) > 0,
                "is_gainer_24h": data["change_24h"] > 0,
                "is_gainer_7d": data.get("change_7d", 0) > 0,
                "volatility_score": abs(data["change_24h"]) + abs(data.get("change_7d", 0))
            },
            "last_updated": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "data_note": "Price includes small real-time variation for simulation"
        }
    else:
        return {
            "error": f"Token '{token_symbol}' not found in our database",
            "available_tokens": sorted([token["symbol"] for token in SIMULATED_MARKET_DATA.values()]),
            "total_tokens_available": len(SIMULATED_MARKET_DATA)
        }