import pygame
import sys

# Initialize
pygame.init()

# Screen
WIDTH, HEIGHT = 1000, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Stickman Football - Full Game")

# Colors
WHITE = (255, 255, 255)
GRASS = (0, 180, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
BALL_COLOR = (255, 255, 0)
BLACK = (0, 0, 0)

# Clock
clock = pygame.time.Clock()
FPS = 60

# Font
font = pygame.font.SysFont("consolas", 36)
big_font = pygame.font.SysFont("consolas", 60)

# Match timer
MATCH_TIME = 60  # seconds
start_ticks = pygame.time.get_ticks()

# Game state
game_over = False

# Player setup
RADIUS = 25
p1 = pygame.Rect(100, HEIGHT // 2, RADIUS * 2, RADIUS * 2)
p2 = pygame.Rect(WIDTH - 150, HEIGHT // 2, RADIUS * 2, RADIUS * 2)
PLAYER_SPEED = 5

# Ball setup
ball = pygame.Rect(WIDTH // 2, HEIGHT // 2, 20, 20)
ball_vel = [0, 0]
BALL_SPEED = 6
BALL_FRICTION = 0.98

# Goal
GOAL_WIDTH = 10
GOAL_HEIGHT = 150

# Score
p1_score = 0
p2_score = 0

# Sound (optional)
try:
    kick_sound = pygame.mixer.Sound(pygame.mixer.Sound(pygame.mixer.get_init()))
except:
    kick_sound = None

def draw_stickman(player, color):
    x = player.centerx
    y = player.top
    pygame.draw.circle(screen, color, (x, y), RADIUS)  # Head
    pygame.draw.line(screen, color, (x, y + RADIUS), (x, y + 2 * RADIUS), 3)  # Body
    pygame.draw.line(screen, color, (x, y + RADIUS + 5), (x - 15, y + RADIUS + 30), 3)
    pygame.draw.line(screen, color, (x, y + RADIUS + 5), (x + 15, y + RADIUS + 30), 3)
    pygame.draw.line(screen, color, (x, y + 2 * RADIUS), (x - 10, y + 2 * RADIUS + 20), 3)
    pygame.draw.line(screen, color, (x, y + 2 * RADIUS), (x + 10, y + 2 * RADIUS + 20), 3)

def reset_ball():
    ball.center = (WIDTH // 2, HEIGHT // 2)
    ball_vel[0] = ball_vel[1] = 0

def display_score():
    score_text = font.render(f"P1: {p1_score}   P2: {p2_score}", True, WHITE)
    screen.blit(score_text, (WIDTH // 2 - score_text.get_width() // 2, 10))

def display_timer():
    seconds = MATCH_TIME - (pygame.time.get_ticks() - start_ticks) // 1000
    timer_text = font.render(f"Time: {max(seconds, 0)}", True, WHITE)
    screen.blit(timer_text, (20, 10))
    return seconds <= 0

def display_winner():
    if p1_score > p2_score:
        msg = "Player 1 Wins! 🏆"
    elif p2_score > p1_score:
        msg = "Player 2 Wins! 🏆"
    else:
        msg = "Match Drawn 🤝"

    winner_text = big_font.render(msg, True, WHITE)
    restart_text = font.render("Press R to Restart", True, WHITE)
    screen.blit(winner_text, (WIDTH // 2 - winner_text.get_width() // 2, HEIGHT // 2 - 50))
    screen.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2 + 20))

# Main loop
running = True
while running:
    clock.tick(FPS)
    screen.fill(GRASS)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()

    if game_over:
        display_winner()
        if keys[pygame.K_r]:
            # Reset game
            p1_score = 0
            p2_score = 0
            start_ticks = pygame.time.get_ticks()
            game_over = False
            reset_ball()
            p1.topleft = (100, HEIGHT // 2)
            p2.topleft = (WIDTH - 150, HEIGHT // 2)
        pygame.display.flip()
        continue

    # Player 1 movement (WASD)
    if keys[pygame.K_a]: p1.x -= PLAYER_SPEED
    if keys[pygame.K_d]: p1.x += PLAYER_SPEED
    if keys[pygame.K_w]: p1.y -= PLAYER_SPEED
    if keys[pygame.K_s]: p1.y += PLAYER_SPEED

    # Player 2 movement (Arrows)
    if keys[pygame.K_LEFT]: p2.x -= PLAYER_SPEED
    if keys[pygame.K_RIGHT]: p2.x += PLAYER_SPEED
    if keys[pygame.K_UP]: p2.y -= PLAYER_SPEED
    if keys[pygame.K_DOWN]: p2.y += PLAYER_SPEED

    # Player 1 Kick (Space)
    if keys[pygame.K_SPACE] and p1.colliderect(ball):
        dx = ball.centerx - p1.centerx
        dy = ball.centery - p1.centery
        ball_vel[0] += dx // max(1, abs(dx)) * BALL_SPEED
        ball_vel[1] += dy // max(1, abs(dy)) * BALL_SPEED
        if kick_sound:
            kick_sound.play()

    # Player 2 Kick (Enter)
    if keys[pygame.K_RETURN] and p2.colliderect(ball):
        dx = ball.centerx - p2.centerx
        dy = ball.centery - p2.centery
        ball_vel[0] += dx // max(1, abs(dx)) * BALL_SPEED
        ball_vel[1] += dy // max(1, abs(dy)) * BALL_SPEED
        if kick_sound:
            kick_sound.play()

    # Ball movement
    ball.x += int(ball_vel[0])
    ball.y += int(ball_vel[1])
    ball_vel[0] *= BALL_FRICTION
    ball_vel[1] *= BALL_FRICTION

    # Bounce off walls
    if ball.left <= 0 or ball.right >= WIDTH:
        ball_vel[0] *= -1
    if ball.top <= 0 or ball.bottom >= HEIGHT:
        ball_vel[1] *= -1

    # Goal Detection
    if ball.left <= GOAL_WIDTH and HEIGHT // 2 - GOAL_HEIGHT // 2 < ball.centery < HEIGHT // 2 + GOAL_HEIGHT // 2:
        p2_score += 1
        reset_ball()
    if ball.right >= WIDTH - GOAL_WIDTH and HEIGHT // 2 - GOAL_HEIGHT // 2 < ball.centery < HEIGHT // 2 + GOAL_HEIGHT // 2:
        p1_score += 1
        reset_ball()

    # Draw Goals
    pygame.draw.rect(screen, WHITE, (0, HEIGHT // 2 - GOAL_HEIGHT // 2, GOAL_WIDTH, GOAL_HEIGHT))
    pygame.draw.rect(screen, WHITE, (WIDTH - GOAL_WIDTH, HEIGHT // 2 - GOAL_HEIGHT // 2, GOAL_WIDTH, GOAL_HEIGHT))

    # Draw Everything
    draw_stickman(p1, RED)
    draw_stickman(p2, BLUE)
    pygame.draw.ellipse(screen, BALL_COLOR, ball)
    display_score()
    game_over = display_timer()

    pygame.display.flip()

pygame.quit()
sys.exit()
