"""
Base templates and shared components 
"""

from ..static import BASE_CSS

# ASCII art for KILOMARKET
KILOMARKET_ASCII = r"""
                                                                                                                                                                                   
                                                                                                                                                                                   
KKKKKKKKK    KKKKKKK  iiii  lllllll                  MMMMMMMM               MMMMMMMM                                    kkkkkkkk                                     tttt          
K:::::::K    K:::::K i::::i l:::::l                  M:::::::M             M:::::::M                                    k::::::k                                  ttt:::t          
K:::::::K    K:::::K  iiii  l:::::l                  M::::::::M           M::::::::M                                    k::::::k                                  t:::::t          
K:::::::K   K::::::K        l:::::l                  M:::::::::M         M:::::::::M                                    k::::::k                                  t:::::t          
KK::::::K  K:::::KKKiiiiiii  l::::l    ooooooooooo   M::::::::::M       M::::::::::M  aaaaaaaaaaaaa  rrrrr   rrrrrrrrr   k:::::k    kkkkkkk eeeeeeeeeeee    ttttttt:::::ttttttt    
  K:::::K K:::::K   i:::::i  l::::l  oo:::::::::::oo M:::::::::::M     M:::::::::::M  a::::::::::::a r::::rrr:::::::::r  k:::::k   k:::::kee::::::::::::ee  t:::::::::::::::::t    
  K::::::K:::::K     i::::i  l::::l o:::::::::::::::oM:::::::M::::M   M::::M:::::::M  aaaaaaaaa:::::ar:::::::::::::::::r k:::::k  k:::::ke::::::eeeee:::::eet:::::::::::::::::t    
  K:::::::::::K      i::::i  l::::l o:::::ooooo:::::oM::::::M M::::M M::::M M::::::M           a::::arr::::::rrrrr::::::rk:::::k k:::::ke::::::e     e:::::etttttt:::::::tttttt    
  K:::::::::::K      i::::i  l::::l o::::o     o::::oM::::::M  M::::M::::M  M::::::M    aaaaaaa:::::a r:::::r     r:::::rk::::::k:::::k e:::::::eeeee::::::e      t:::::t          
  K::::::K:::::K     i::::i  l::::l o::::o     o::::oM::::::M   M:::::::M   M::::::M  aa::::::::::::a r:::::r     rrrrrrrk:::::::::::k  e:::::::::::::::::e       t:::::t          
  K:::::K K:::::K    i::::i  l::::l o::::o     o::::oM::::::M    M:::::M    M::::::M a::::aaaa::::::a r:::::r            k:::::::::::k  e::::::eeeeeeeeeee        t:::::t          
KK::::::K  K:::::KKK i::::i  l::::l o::::o     o::::oM::::::M     MMMMM     M::::::Ma::::a    a:::::a r:::::r            k::::::k:::::k e:::::::e                 t:::::t    tttttt
K:::::::K   K::::::Ki::::::il::::::lo:::::ooooo:::::oM::::::M               M::::::Ma::::a    a:::::a r:::::r           k::::::k k:::::ke::::::::e                t::::::tttt:::::t
K:::::::K    K:::::Ki::::::il::::::lo:::::::::::::::oM::::::M               M::::::Ma:::::aaaa::::::a r:::::r           k::::::k  k:::::ke::::::::eeeeeeee        tt::::::::::::::t
K:::::::K    K:::::Ki::::::il::::::l oo:::::::::::oo M::::::M               M::::::M a::::::::::aa:::ar:::::r           k::::::k   k:::::kee:::::::::::::e          tt:::::::::::tt
KKKKKKKKK    KKKKKKKiiiiiiiillllllll   ooooooooooo   MMMMMMMM               MMMMMMMM  aaaaaaaaaa  aaaarrrrrrr           kkkkkkkk    kkkkkkk eeeeeeeeeeeeee            ttttttttttt  
                                                                                                                                                                                   
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
"""

def base_template(title: str, content: str, additional_css: str = "", additional_js: str = "") -> str:
    """Base template wrapper for all pages"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
{BASE_CSS}
{additional_css}
    </style>
</head>
<body>
    <div class="crt"></div>
    <div class="terminal">
        {content}
    </div>
    <script>
{additional_js}
    </script>
</body>
</html>"""
