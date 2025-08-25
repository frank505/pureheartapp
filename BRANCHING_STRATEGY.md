# PureHeart Branching Strategy & CI/CD Flow

## 🌿 Branch Structure

```
production   ← App Store / Play Store deployments (PRODUCTION)
     ↑
   main      ← Production-ready testing via TestFlight (STAGING)
     ↑
  develop    ← Active development & TestFlight testing (DEVELOPMENT)
     ↑
feature/*    ← Feature development branches
```

## 📱 Platform-Specific Deployment Strategy

### iOS Deployment Flow

| Branch | Destination | Purpose | Auto-Deploy |
|--------|------------|---------|-------------|
| `develop` | TestFlight | Internal development testing | ✅ |
| `staging` | TestFlight | Staging environment testing | ✅ |
| `main/master` | TestFlight | Production-ready validation | ✅ |
| `production` | App Store Connect | App Store review submission | ✅ |

### Android Deployment Flow

| Branch | Build | Play Store | Purpose |
|--------|-------|------------|---------|
| `develop` | ✅ Production APK/AAB | ❌ | Development artifacts |
| `staging` | ✅ Production APK/AAB | ❌ | Staging artifacts |
| `main/master` | ✅ Production APK/AAB | ❌ | Production-ready artifacts |
| `production` | ✅ Production APK/AAB | ✅ | Play Store deployment |

## 🚀 Deployment Workflows

### 1. Development → TestFlight (iOS)
```bash
# Work on feature
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature

# Merge to develop
git checkout develop
git merge feature/new-feature
git push origin develop
# → Triggers iOS TestFlight deployment automatically
```

### 2. Staging Validation
```bash
# Promote develop to staging
git checkout staging
git merge develop
git push origin staging
# → Triggers iOS TestFlight deployment (staging environment)
```

### 3. Production-Ready Testing
```bash
# Promote staging to main
git checkout main
git merge staging
git push origin main
# → Triggers iOS TestFlight deployment (production-ready testing)
# → Builds Android production APK/AAB (artifacts only)
```

### 4. Production Store Deployment
```bash
# Promote main to production
git checkout production
git merge main
git push origin production
# → Triggers iOS App Store Connect submission
# → Triggers Android Play Store deployment
```

## 🎯 Environment Mapping

### iOS Environments
- **Development**: `develop` branch → TestFlight (internal testing)
- **Staging**: `staging` branch → TestFlight (staging validation)
- **Production Testing**: `main/master` branch → TestFlight (final validation)
- **Production Release**: `production` branch → App Store Connect

### Android Environments
- **Development**: `develop` branch → Build artifacts only
- **Staging**: `staging` branch → Build artifacts only  
- **Production Testing**: `main/master` branch → Build artifacts only
- **Production Release**: `production` branch → Play Store deployment

## 🔄 Manual Triggers

All workflows support manual triggers with environment selection:

### iOS TestFlight Manual Trigger
- **Environment Options**: staging, production
- **Use Case**: Hotfixes, emergency deployments

### iOS App Store Manual Trigger  
- **Inputs**: Version number, release notes
- **Use Case**: Specific version submissions

### Android Manual Trigger
- **Environment Options**: staging, production
- **Use Case**: Custom builds, emergency releases

## 📋 Pre-Deployment Checklist

### Before Pushing to `main`
- [ ] All tests pass
- [ ] Code review completed
- [ ] Staging validation successful
- [ ] Version number updated in `package.json`
- [ ] Release notes prepared

### Before Pushing to `production`
- [ ] TestFlight testing completed
- [ ] Stakeholder approval received
- [ ] App Store Connect metadata updated
- [ ] Google Play Console metadata updated
- [ ] Screenshots and descriptions current

## 🚨 Emergency Hotfix Process

```bash
# Create hotfix from production
git checkout production
git checkout -b hotfix/critical-fix

# Make necessary changes
git commit -m "Fix critical issue"
git push origin hotfix/critical-fix

# Merge back to production
git checkout production
git merge hotfix/critical-fix
git push origin production
# → Triggers immediate production deployment

# Backport to main and develop
git checkout main
git merge hotfix/critical-fix
git push origin main

git checkout develop  
git merge hotfix/critical-fix
git push origin develop
```

## 📊 Monitoring & Notifications

### Slack Notifications Include:
- ✅ Environment being deployed to
- ✅ Branch name and commit hash
- ✅ Build number and version
- ✅ Store deployment status
- ✅ Success/failure status

### Example Notification:
```
✅ iOS TestFlight deployment successful!
Environment: production-testflight
Branch: main
Build: 123
Commit: abc123def
```

## 🔐 Security Considerations

- **Branch Protection**: `main` and `production` branches require pull request reviews
- **Secrets Management**: All certificates and API keys stored as GitHub secrets
- **Access Control**: Production deployments restricted to authorized team members
- **Audit Trail**: All deployments logged and trackable

## 🎉 Best Practices

1. **Always test in TestFlight** before production submission
2. **Use descriptive commit messages** for better tracking
3. **Tag production releases** with semantic versioning
4. **Monitor deployment notifications** for immediate feedback
5. **Keep certificates and provisioning profiles updated**
6. **Regular secret rotation** for enhanced security
7. **Document breaking changes** in release notes

---

This branching strategy ensures safe, controlled deployments while maintaining development velocity and production stability.
