# SSH Server Setup Guide

This guide documents the steps taken to configure SSH access on this machine with key-based authentication and fail2ban protection.

## Prerequisites

- Ubuntu/Debian-based Linux system
- Sudo access
- SSH server package installed

## Step 1: Enable and Start SSH Server

First, we checked if SSH was installed and enabled the service:

```bash
# Check SSH server status
sudo systemctl status ssh

# Enable and start SSH server
sudo systemctl enable --now ssh
```

The SSH server is now listening on port 22 for all network interfaces (0.0.0.0).

## Step 2: Get Machine IP Address

Find your machine's local IP address:

```bash
ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v 127.0.0.1
```

**Result:** Local IP is `192.168.2.33`

Other machines can now connect using: `ssh danny@192.168.2.33`

## Step 3: Set Up SSH Key-Based Authentication

### 3.1 Verify Existing SSH Keys

```bash
# Check for existing SSH keys
ls -la ~/.ssh/id_*.pub
```

**Result:** Found existing key `/home/danny/.ssh/id_ed25519.pub`

### 3.2 Configure Authorized Keys

```bash
# Copy public key to authorized_keys for local testing
cp ~/.ssh/id_ed25519.pub ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys
```

**Your Public Key:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAO/iDzxjr4lAqGlkBoU4WqBgMDeXUBgxh0mx3xcnW5J benny28dany@gmail.com
```

## Step 4: Disable Password Authentication

### 4.1 Backup SSH Configuration

```bash
# Create backup of original config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
```

### 4.2 Modify SSH Configuration

```bash
# Disable password authentication
sudo sed -i 's/^#*PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Enable public key authentication
sudo sed -i 's/^#*PubkeyAuthentication no/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/^#*PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Disable challenge-response authentication
sudo sed -i 's/^#*ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config

# Disable PAM
sudo sed -i 's/^#*UsePAM yes/UsePAM no/' /etc/ssh/sshd_config
```

### 4.3 Verify Configuration

```bash
# Check the modified settings
sudo grep -E "^(PasswordAuthentication|PubkeyAuthentication|ChallengeResponseAuthentication|UsePAM)" /etc/ssh/sshd_config
```

**Result:**
```
PubkeyAuthentication yes
PasswordAuthentication no
UsePAM no
```

### 4.4 Test Configuration

```bash
# Test SSH config for syntax errors
sudo sshd -t
```

## Step 5: Install and Configure Fail2ban

### 5.1 Install Fail2ban

```bash
# Install fail2ban package
sudo apt install fail2ban -y
```

### 5.2 Create Local Configuration

```bash
# Copy default configuration to local file
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

### 5.3 Configure SSH Protection

Create custom jail configuration:

```bash
sudo bash -c "cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
destemail = your-email@example.com
sendername = Fail2Ban
action = %(action_)s

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
maxretry = 3
bantime = 24h
findtime = 10m
EOF"
```

**Configuration Details:**
- **Default bantime:** 1 hour for most services
- **SSH maxretry:** 3 failed attempts
- **SSH bantime:** 24 hours
- **SSH findtime:** 10 minutes window for tracking attempts

## Step 6: Restart Services

```bash
# Restart SSH service with new configuration
sudo systemctl restart ssh

# Enable and start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Step 7: Verify Everything is Working

### 7.1 Check SSH Status

```bash
sudo systemctl status ssh
```

**Result:** Active and running on port 22

### 7.2 Check Fail2ban Status

```bash
# General status
sudo systemctl status fail2ban

# SSH jail specific status
sudo fail2ban-client status sshd
```

**Result:**
```
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     0
|  `- Journal matches:  _SYSTEMD_UNIT=sshd.service + _COMM=sshd
`- Actions
   |- Currently banned: 0
   |- Total banned:     0
   `- Banned IP list:
```

## Connecting from Other Machines

### Option 1: Using Existing Key (if you have the private key)

On the client machine that has the private key matching the public key:

```bash
ssh danny@192.168.2.33
```

### Option 2: Generate New Key on Client Machine

On the client machine:

```bash
# Generate new SSH key pair
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key to clipboard
cat ~/.ssh/id_ed25519.pub
```

On the server (this machine), add the client's public key:

```bash
# Add client's public key to authorized_keys
echo "client-public-key-here" >> ~/.ssh/authorized_keys

# Ensure proper permissions
chmod 600 ~/.ssh/authorized_keys
```

## Security Features Enabled

✅ **SSH Key-Based Authentication Only**
- Password authentication disabled
- Only users with valid SSH keys can connect
- More secure than password-based authentication

✅ **Fail2ban Brute Force Protection**
- Automatically bans IPs after 3 failed login attempts
- 24-hour ban duration for SSH attacks
- Monitors authentication logs in real-time

## Useful Commands

### SSH Management

```bash
# Restart SSH service
sudo systemctl restart ssh

# Check SSH logs
sudo journalctl -u ssh -f

# Test SSH config
sudo sshd -t
```

### Fail2ban Management

```bash
# Check fail2ban status
sudo systemctl status fail2ban

# Check SSH jail status
sudo fail2ban-client status sshd

# Unban an IP address
sudo fail2ban-client set sshd unbanip <IP_ADDRESS>

# Check fail2ban logs
sudo tail -f /var/log/fail2ban.log

# Ban an IP manually
sudo fail2ban-client set sshd banip <IP_ADDRESS>
```

### Firewall (Optional)

If you have UFW firewall enabled:

```bash
# Allow SSH through firewall
sudo ufw allow ssh

# Check firewall status
sudo ufw status
```

## Troubleshooting

### Cannot Connect with Password

This is expected! Password authentication is disabled. You must use SSH keys.

### "Permission denied (publickey)" Error

- Ensure your public key is in `~/.ssh/authorized_keys` on the server
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
- Verify you're using the correct private key on the client

### Locked Out After Multiple Attempts

You may have been banned by fail2ban. From another machine or console:

```bash
# Check if you're banned
sudo fail2ban-client status sshd

# Unban yourself
sudo fail2ban-client set sshd unbanip YOUR_IP
```

### Restore Original SSH Config

If you need to revert changes:

```bash
sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
sudo systemctl restart ssh
```

## Summary

Your machine is now configured with:
- **SSH server running** on port 22
- **Key-based authentication only** (passwords disabled)
- **Fail2ban protection** against brute force attacks
- **IP address:** 192.168.2.33

Connect from other machines using: `ssh danny@192.168.2.33`
