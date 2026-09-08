# API Response Envelope Convention

## 1. Response Envelope

All API responses must use this envelope:

```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    total?: number;
    nextCursor?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### Success Example

```json
{
  "data": { "id": "abc", "name": "Jane Developer" },
  "meta": { "page": 1, "total": 42 }
}
```

### Error Example

```json
{
  "error": { "code": "ENTITY_NOT_FOUND", "message": "Provider with id abc not found" }
}
```

## 2. ID Consistency Rules

**Rule**: An endpoint `GET /providers/:id` must filter by `where: { id: req.params.id }`, NOT by `where: { userId: req.params.id }`.

### Bug #5 Example (Provider ID mismatch)

**Wrong** (caused bug #5):
```typescript
// Frontend sends entity.id (UserProfile ID)
// Backend filters by userId (User ID) → "entity not found"
router.get("/:id", (req, res) => {
  const provider = await prisma.entityProfile.findFirst({
    where: { userId: req.params.id } // WRONG: req.params.id is UserProfile ID
  });
});
```

**Correct**:
```typescript
router.get("/:id", (req, res) => {
  const provider = await prisma.entityProfile.findUnique({
    where: { id: req.params.id } // CORRECT: filter by the same ID from URL
  });
});
```

### Rule Summary

| Endpoint | URL Param | `where` field |
|---|---|---|
| `GET /providers/:id` | `:id` = UserProfile ID | `id: req.params.id` |
| `GET /users/:id` | `:id` = User ID | `id: req.params.id` |
| `GET /providers/:id/reviews` | `:id` = UserProfile ID | `providerId: req.params.id` (or join) |

**Never** mix: if URL says `:id`, filter by `id`. If URL says `:userId`, filter by `userId`.

## 3. Helper Functions for Nested/Flat Fields

Bug #4: Frontend accessed `entity.profile?.rating` but API returned flat UserProfile with `user` nested. Helpers handle both shapes:

```typescript
import type { UserProfile, User } from "@scope/shared-types";

type MaybeProfile = {
  id?: string;
  user?: Partial<User>;
  userId?: string;
  name?: string;
  avatar?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  profile?: { rating?: number; lat?: number; lng?: number };
};

export function getProfileName(provider: MaybeProfile): string {
  return provider.user?.name ?? provider.name ?? "Unknown";
}

export function getProfileAvatar(provider: MaybeProfile): string {
  return provider.user?.avatar ?? provider.avatar ?? "";
}

export function getProfileRating(provider: MaybeProfile): number {
  return entity.profile?.rating ?? provider.rating ?? 0;
}

export function getProfileLat(provider: MaybeProfile): number {
  return entity.profile?.lat ?? provider.lat ?? 0;
}

export function getProfileLng(provider: MaybeProfile): number {
  return entity.profile?.lng ?? provider.lng ?? 0;
}
```

## 4. Prisma Relation Shaping

Bug #6: Prisma returns `UserGallery[]` (objects `{id, imageUrl, caption}`) but frontend treated as `string[]`.

**Wrong**:
```typescript
// Frontend assumed strings
gallery.map((img: string) => <img src={img} />) // Shows [object Object]
```

**Correct**:
```typescript
// Frontend uses the typed relation
gallery.map((img: UserGallery) => <img src={img.imageUrl} alt={img.caption} />)
```

**Backend should shape relations**:
```typescript
// In the service/controller, map to a clean shape
const provider = await prisma.entityProfile.findUnique({
  where: { id },
  include: { user: true, gallery: true }
});

return {
  data: {
    id: entity.id,
    name: provider.user.name,
    avatar: provider.user.avatar,
    gallery: provider.gallery.map(g => ({ id: g.id, imageUrl: g.imageUrl, caption: g.caption })),
  }
};
```
