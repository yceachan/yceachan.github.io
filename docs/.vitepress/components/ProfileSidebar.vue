<template>
  <div class="profile-sidebar" :class="{ 'is-open': explorerStore.profileOpen }">
    <div class="profile-overlay" v-if="explorerStore.profileOpen" @click="close"></div>
    <div class="profile-content">
      <div class="profile-header">
        <img :src="profile.photo" alt="Avatar" class="avatar" v-if="profile.photo" />
        <h2 class="name">{{ profile.name }}</h2>
        <p class="bio">{{ profile.bio }}</p>
      </div>
      <div class="profile-links">
        <a
          v-for="item in contactLinks"
          :key="item.label"
          :href="item.href"
          class="link-item"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noreferrer noopener' : undefined"
        >
          <span class="link-icon" aria-hidden="true">
            <svg v-if="item.kind === 'email'" class="email-mark" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <svg v-else-if="item.kind === 'github'" class="github-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <svg v-else-if="item.kind === 'friend'" viewBox="0 0 24 24" fill="none">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <path d="M20 8v6" />
              <path d="M23 11h-6" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <path d="M3 12h15.5" />
              <path d="m13.5 6 7 6-7 6" />
            </svg>
          </span>
          <span class="link-value">{{ item.value }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { explorerStore } from '../explorerStore'

type Profile = {
  photo?: string
  name?: string
  bio?: string
  mail?: string
  github?: string
  repo?: string
  friends?: string[]
}

type ContactLink = {
  kind: 'email' | 'github' | 'repo' | 'friend'
  label: string
  value: string
  href: string
  external: boolean
}

const { theme } = useData()
const profile = (theme.value.profile || {}) as Profile

const getDisplayNameFromUrl = (url: string, fallback: string) => {
  try {
    const pathname = new URL(url).pathname.replace(/\/+$/, '')
    const segments = pathname.split('/').filter(Boolean)
    return segments.at(-1) || fallback
  } catch {
    return fallback
  }
}

const toMailto = (email: string) => email.startsWith('mailto:') ? email : `mailto:${email}`

const getFriendNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split('/').filter(Boolean)
    if (parsed.hostname.includes('github.com') && segments[0]) {
      return segments[0]
    }
    return segments.at(-1) || parsed.hostname
  } catch {
    return 'friend'
  }
}

const contactLinks = computed<ContactLink[]>(() => {
  const links: ContactLink[] = []

  if (profile.mail) {
    links.push({
      kind: 'email',
      label: 'Email',
      value: profile.mail,
      href: toMailto(profile.mail),
      external: false
    })
  }

  if (profile.github) {
    const githubName = profile.name || getDisplayNameFromUrl(profile.github, 'user')
    links.push({
      kind: 'github',
      label: 'GitHub',
      value: `github/${githubName}`,
      href: profile.github,
      external: true
    })
  }

  if (profile.repo) {
    links.push({
      kind: 'repo',
      label: 'Repo',
      value: getDisplayNameFromUrl(profile.repo, 'Repo'),
      href: profile.repo,
      external: true
    })
  }

  for (const friend of profile.friends || []) {
    if (!friend) continue
    links.push({
      kind: 'friend',
      label: 'Friend',
      value:  getDisplayNameFromUrl(friend, 'Repo'),
      href: friend,
      external: true
    })
  }

  return links
})

const close = () => {
  explorerStore.profileOpen = false
}
</script>

<style scoped>
.profile-sidebar {
  background: transparent;
}
.profile-content {
  padding: 24px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
}
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 16px;
}
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 16px;
  object-fit: cover;
}
.name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
}
.bio {
  color: var(--vp-c-text-2);
  font-size: 14px;
  margin: 0;
}
.profile-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(100%, 320px);
  margin: 0 auto;
}
.link-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  text-align: left;
  font-size: 14px;
  padding: 6px 8px;
  border-radius: 0;
  background: transparent;
  transition: color 0.2s, background-color 0.2s;
}
.link-item:hover {
  background: var(--vp-c-default-soft);
}
.link-icon {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  color: var(--vp-c-text-1);
}
.link-icon svg {
  width: 18px;
  height: 18px;
  display: block;
  stroke: #111;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.link-icon svg.github-mark {
  stroke: none;
  fill: currentColor;
}
.link-icon svg.email-mark {
  width: 20px;
  height: 20px;
}

.link-value {
  min-width: 0;
  flex: 1;
  word-break: break-all;
  font-size: 14px;
}

@media (max-width: 959px) {
  .profile-sidebar {
    display: block !important;
    position: fixed;
    top: var(--vp-nav-height);
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 100;
    pointer-events: none;
    background: transparent;
  }
  .profile-sidebar.is-open {
    pointer-events: auto;
  }
  .profile-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .is-open .profile-overlay {
    opacity: 1;
  }
  .profile-content {
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 280px;
    background: var(--vp-c-bg);
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .is-open .profile-content {
    transform: translateX(0);
  }
}
</style>
