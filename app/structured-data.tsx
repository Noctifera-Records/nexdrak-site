export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicGroup",
        "@id": "https://nexdrak.com/#musicgroup",
        "name": "NexDrak",
        "alternateName": ["NEXDRAK"],
        "description": "Electronic music artist specializing in dubstep, darkwave, and synth music",
        "url": "https://nexdrak.com",
        "sameAs": [
          "https://open.spotify.com/artist/nexdrak",
          "https://soundcloud.com/nexdrak",
          "https://www.youtube.com/@nexdrak",
          "https://x.com/nexdrak",
          "https://instagram.com/nexdrak"
        ],
        "genre": ["Electronic", "Dubstep", "Darkwave", "Synth", "EDM"],
        "foundingDate": "2020",
        "member": {
          "@type": "Person",
          "name": "NexDrak"
        },
        "album": [
          {
            "@type": "MusicAlbum",
            "name": "Red Eye Flight",
            "datePublished": "2024",
            "byArtist": {
              "@id": "https://nexdrak.com/#musicgroup"
            }
          }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://nexdrak.com/#website",
        "url": "https://nexdrak.com",
        "name": "NexDrak Official Website",
        "description": "Official website of NexDrak - Electronic Music Artist",
        "publisher": {
          "@id": "https://nexdrak.com/#musicgroup"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://nexdrak.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://nexdrak.com/#organization",
        "name": "NexDrak",
        "url": "https://nexdrak.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nexdrak.com/img/logo.png",
          "width": 512,
          "height": 512
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "url": "https://nexdrak.com/contact"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}