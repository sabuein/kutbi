"use strict";

import {
    getConnectionFromPool,
    executeQuery,
    releaseConnection
} from "../modules/data.mjs";

const Post = class {

    #uuid = null;

    static _total = 0;

    static get total() {
        return Post._total.toString();
    }

    constructor(details) {
        Post._total++;
        this.#uuid = details.uuid;
        // Additional properties can be added here
    }
};

// GET /admin/posts/?formats=html,mobiledoc
const x = {
    "posts": [
        {
            "slug": "welcome-short",
            "id": "5ddc9141c35e7700383b2937",
            "uuid": "a5aa9bd8-ea31-415c-b452-3040dae1e730",
            "title": "Welcome",
            "mobiledoc": "{\"version\":\"0.3.1\",\"atoms\":[],\"cards\":[],\"markups\":[],\"sections\":[[1,\"p\",[[0,[],0,\"👋 Welcome, it's great to have you here.\"]]]]}",
            "html": "<p>👋 Welcome, it's great to have you here.</p>",
            "comment_id": "5ddc9141c35e7700383b2937",
            "feature_image": "https://static.ghost.org/v3.0.0/images/welcome-to-ghost.png",
            "feature_image_alt": null,
            "feature_image_caption": null,
            "featured": false,
            "status": "published",
            "visibility": "public",
            "created_at": "2019-11-26T02:43:13.000Z",
            "updated_at": "2019-11-26T02:44:17.000Z",
            "published_at": "2019-11-26T02:44:17.000Z",
            "custom_excerpt": null,
            "codeinjection_head": null,
            "codeinjection_foot": null,
            "custom_template": null,
            "canonical_url": null,
            "tags": [
                {
                    "created_at": "2019-11-26T02:39:31.000Z",
                    "description": null,
                    "feature_image": null,
                    "id": "5ddc9063c35e7700383b27e0",
                    "meta_description": null,
                    "meta_title": null,
                    "name": "Getting Started",
                    "slug": "getting-started",
                    "updated_at": "2019-11-26T02:39:31.000Z",
                    "url": "https://docs.ghost.io/tag/getting-started/",
                    "visibility": "public"
                }
            ],
            "authors": [
                {
                    "id": "5951f5fca366002ebd5dbef7",
                    "name": "Ghost",
                    "slug": "ghost-user",
                    "email": "info@ghost.org",
                    "profile_image": "//www.gravatar.com/avatar/2fab21a4c4ed88e76add10650c73bae1?s=250&d=mm&r=x",
                    "cover_image": null,
                    "bio": null,
                    "website": "https://ghost.org",
                    "location": "The Internet",
                    "facebook": "ghost",
                    "twitter": "@ghost",
                    "accessibility": null,
                    "status": "locked",
                    "meta_title": null,
                    "meta_description": null,
                    "tour": null,
                    "last_seen": null,
                    "created_at": "2019-11-26T02:39:32.000Z",
                    "updated_at": "2019-11-26T04:30:57.000Z",
                    "roles": [
                        {
                            "id": "5ddc9063c35e7700383b27e3",
                            "name": "Author",
                            "description": "Authors",
                            "created_at": "2019-11-26T02:39:31.000Z",
                            "updated_at": "2019-11-26T02:39:31.000Z"
                        }
                    ],
                    "url": "https://docs.ghost.io/author/ghost-user/"
                }
            ],
            "primary_author": {
                "id": "5951f5fca366002ebd5dbef7",
                "name": "Ghost",
                "slug": "ghost-user",
                "email": "info@ghost.org",
                "profile_image": "//www.gravatar.com/avatar/2fab21a4c4ed88e76add10650c73bae1?s=250&d=mm&r=x",
                "cover_image": null,
                "bio": null,
                "website": "https://ghost.org",
                "location": "The Internet",
                "facebook": "ghost",
                "twitter": "@ghost",
                "accessibility": null,
                "status": "locked",
                "meta_title": null,
                "meta_description": null,
                "tour": null,
                "last_seen": null,
                "created_at": "2019-11-26T02:39:32.000Z",
                "updated_at": "2019-11-26T04:30:57.000Z",
                "roles": [
                    {
                        "id": "5ddc9063c35e7700383b27e3",
                        "name": "Author",
                        "description": "Authors",
                        "created_at": "2019-11-26T02:39:31.000Z",
                        "updated_at": "2019-11-26T02:39:31.000Z"
                    }
                ],
                "url": "https://docs.ghost.io/author/ghost-user/"
            },
            "primary_tag": {
                "id": "5ddc9063c35e7700383b27e0",
                "name": "Getting Started",
                "slug": "getting-started",
                "description": null,
                "feature_image": null,
                "visibility": "public",
                "meta_title": null,
                "meta_description": null,
                "created_at": "2019-11-26T02:39:31.000Z",
                "updated_at": "2019-11-26T02:39:31.000Z",
                "og_image": null,
                "og_title": null,
                "og_description": null,
                "twitter_image": null,
                "twitter_title": null,
                "twitter_description": null,
                "codeinjection_head": null,
                "codeinjection_foot": null,
                "canonical_url": null,
                "accent_color": null,
                "parent": null,
                "url": "https://docs.ghost.io/tag/getting-started/"
            },
            "url": "https://docs.ghost.io/welcome-short/",
            "excerpt": "👋 Welcome, it's great to have you here.",
            "og_image": null,
            "og_title": null,
            "og_description": null,
            "twitter_image": null,
            "twitter_title": null,
            "twitter_description": null,
            "meta_title": null,
            "meta_description": null,
            "email_only": false,
            "newsletter": {
                "id": "62750bff2b868a34f814af08",
                "name": "Weekly newsletter",
                "description": null,
                "slug": "default-newsletter",
                "sender_name": "Weekly newsletter",
                "sender_email": null,
                "sender_reply_to": "newsletter",
                "status": "active",
                "visibility": "members",
                "subscribe_on_signup": true,
                "sort_order": 0,
                "header_image": null,
                "show_header_icon": true,
                "show_header_title": true,
                "title_font_category": "sans_serif",
                "title_alignment": "center",
                "show_feature_image": true,
                "body_font_category": "sans_serif",
                "footer_content": null,
                "show_badge": true,
                "created_at": "2022-06-06T11:52:31.000Z",
                "updated_at": "2022-06-20T07:43:43.000Z",
                "show_header_name": true,
                "uuid": "59fbce16-c0bf-4583-9bb3-5cd52db43159"
            },
            "email": {
                "id": "628f3b462de0a130909d4a6a",
                "uuid": "955305de-d89e-4468-927f-2d2b8fec88e5",
                "status": "submitted",
                "recipient_filter": "status:-free",
                "error": null,
                "error_data": "[]",
                "email_count": 256,
                "delivered_count": 256,
                "opened_count": 59,
                "failed_count": 0,
                "subject": "Welcome",
                "from": "\"Weekly newsletter\"<noreply@example.com>",
                "reply_to": "noreply@example.com",
                "html": "...",
                "plaintext": "...",
                "track_opens": true,
                "submitted_at": "2022-05-26T08:33:10.000Z",
                "created_at": "2022-06-26T08:33:10.000Z",
                "updated_at": "2022-06-26T08:33:16.000Z"
            }
        }
    ]
};

export { Post };