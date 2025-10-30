# File Upload & Assignment Flow

## How It Works Now:

### 1. Admin Uploads Files (`/admin/upload`)
- Admin selects files to upload
- **Must select a team member** from the dropdown (required)
- Files are uploaded to Supabase Storage
- File metadata is saved to database with:
  - `assigned_to`: Member's user ID
  - `assigned_to_name`: Member's name
  - `uploaded_by`: Admin's user ID
  - `uploaded_at`: Timestamp
  - `url`: Download URL
  - `size`, `name`, `type`: File details

### 2. Files Are Stored
- **Supabase Storage**: Actual file storage in `team-files` bucket
- **Database Table**: `files` table with metadata
- Storage usage is tracked and displayed

### 3. Members View Their Files (`/member/files`)
- Members see only files assigned to them
- Files are filtered by `assignedTo === userProfile.uid`
- Can search through their files
- Can download files directly

### 4. Admin Views All Files (`/admin/files`)
- Admin can see all uploaded files
- Can filter and search
- Can delete files
- Can download files

## Key Features:

✅ **Real Team Members**: Dropdown loads actual members from database
✅ **Required Assignment**: Must select a member before uploading
✅ **Success Messages**: Shows confirmation when files are uploaded
✅ **Storage Tracking**: Real-time storage usage calculation
✅ **Member Access**: Members only see their assigned files
✅ **Download**: Direct download links for all files

## Test Flow:

1. Go to `/admin/upload`
2. Select a team member from dropdown
3. Upload a file
4. See success message
5. Login as that member
6. Go to `/member/files`
7. See the uploaded file
8. Download it

## Database Structure:

```
files/
  {fileId}/
    - name: "document.pdf"
    - size: 1024000
    - url: "https://..."
    - assignedTo: "userId123"
    - assignedToName: "John Doe"
    - uploadedBy: "admin"
    - uploadedAt: timestamp
    - type: "application/pdf"
```
