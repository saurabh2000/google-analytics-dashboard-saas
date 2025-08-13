// Multi-level drill-down data structure for traffic sources
export interface DrillDownData {
  [key: string]: {
    name: string
    value: number
    percentage: number
    children?: DrillDownData
    color?: string
  }
}

export interface DrillDownBreadcrumb {
  name: string
  key: string
}

export const getDrillDownData = (propertyName: string | null): DrillDownData => {
  const isEcommerce = propertyName === 'E-commerce Site'
  const isWebsite = propertyName === 'My Website'
  
  if (isEcommerce) {
    return {
      'organic-search': {
        name: 'Organic Search',
        value: 12500,
        percentage: 32.1,
        color: 'rgb(34, 197, 94)',
        children: {
          'google': {
            name: 'Google',
            value: 9800,
            percentage: 78.4,
            color: 'rgb(34, 197, 94)'
          },
          'bing': {
            name: 'Bing',
            value: 1650,
            percentage: 13.2,
            color: 'rgb(59, 130, 246)'
          },
          'yahoo': {
            name: 'Yahoo',
            value: 750,
            percentage: 6.0,
            color: 'rgb(168, 85, 247)'
          },
          'duckduckgo': {
            name: 'DuckDuckGo',
            value: 300,
            percentage: 2.4,
            color: 'rgb(251, 191, 36)'
          }
        }
      },
      'paid-search': {
        name: 'Paid Search',
        value: 8900,
        percentage: 22.9,
        color: 'rgb(59, 130, 246)',
        children: {
          'google-ads': {
            name: 'Google Ads',
            value: 6750,
            percentage: 75.8,
            color: 'rgb(34, 197, 94)',
            children: {
              'search-campaigns': {
                name: 'Search Campaigns',
                value: 4200,
                percentage: 62.2,
                color: 'rgb(34, 197, 94)'
              },
              'shopping-campaigns': {
                name: 'Shopping Campaigns',
                value: 1800,
                percentage: 26.7,
                color: 'rgb(59, 130, 246)'
              },
              'display-campaigns': {
                name: 'Display Campaigns',
                value: 750,
                percentage: 11.1,
                color: 'rgb(168, 85, 247)'
              }
            }
          },
          'bing-ads': {
            name: 'Bing Ads',
            value: 1580,
            percentage: 17.8,
            color: 'rgb(59, 130, 246)'
          },
          'reddit-ads': {
            name: 'Reddit Ads',
            value: 390,
            percentage: 4.4,
            color: 'rgb(239, 68, 68)'
          },
          'amazon-ads': {
            name: 'Amazon Ads',
            value: 180,
            percentage: 2.0,
            color: 'rgb(251, 191, 36)'
          }
        }
      },
      'direct': {
        name: 'Direct',
        value: 7200,
        percentage: 18.5,
        color: 'rgb(251, 191, 36)',
        children: {
          'direct-type': {
            name: 'Direct Type',
            value: 4800,
            percentage: 66.7,
            color: 'rgb(251, 191, 36)'
          },
          'bookmarks': {
            name: 'Bookmarks',
            value: 1800,
            percentage: 25.0,
            color: 'rgb(34, 197, 94)'
          },
          'mobile-app': {
            name: 'Mobile App',
            value: 600,
            percentage: 8.3,
            color: 'rgb(59, 130, 246)'
          }
        }
      },
      'social-media': {
        name: 'Social Media',
        value: 4300,
        percentage: 11.0,
        color: 'rgb(168, 85, 247)',
        children: {
          'facebook': {
            name: 'Facebook',
            value: 1650,
            percentage: 38.4,
            color: 'rgb(59, 130, 246)',
            children: {
              'organic-facebook': {
                name: 'Organic Posts',
                value: 980,
                percentage: 59.4,
                color: 'rgb(34, 197, 94)'
              },
              'facebook-ads': {
                name: 'Facebook Ads',
                value: 670,
                percentage: 40.6,
                color: 'rgb(239, 68, 68)'
              }
            }
          },
          'instagram': {
            name: 'Instagram',
            value: 1200,
            percentage: 27.9,
            color: 'rgb(236, 72, 153)',
            children: {
              'organic-instagram': {
                name: 'Organic Posts',
                value: 850,
                percentage: 70.8,
                color: 'rgb(34, 197, 94)'
              },
              'instagram-ads': {
                name: 'Instagram Ads',
                value: 350,
                percentage: 29.2,
                color: 'rgb(239, 68, 68)'
              }
            }
          },
          'linkedin': {
            name: 'LinkedIn',
            value: 890,
            percentage: 20.7,
            color: 'rgb(59, 130, 246)',
            children: {
              'organic-linkedin': {
                name: 'Organic Posts',
                value: 540,
                percentage: 60.7,
                color: 'rgb(34, 197, 94)'
              },
              'linkedin-ads': {
                name: 'LinkedIn Ads',
                value: 350,
                percentage: 39.3,
                color: 'rgb(239, 68, 68)'
              }
            }
          },
          'twitter': {
            name: 'Twitter/X',
            value: 560,
            percentage: 13.0,
            color: 'rgb(0, 0, 0)'
          }
        }
      },
      'email': {
        name: 'Email',
        value: 3800,
        percentage: 9.8,
        color: 'rgb(239, 68, 68)',
        children: {
          'newsletters': {
            name: 'Newsletters',
            value: 2200,
            percentage: 57.9,
            color: 'rgb(34, 197, 94)'
          },
          'promotional': {
            name: 'Promotional Emails',
            value: 980,
            percentage: 25.8,
            color: 'rgb(59, 130, 246)'
          },
          'transactional': {
            name: 'Transactional Emails',
            value: 620,
            percentage: 16.3,
            color: 'rgb(168, 85, 247)'
          }
        }
      },
      'referral': {
        name: 'Referral',
        value: 2100,
        percentage: 5.4,
        color: 'rgb(34, 197, 94)',
        children: {
          'partner-sites': {
            name: 'Partner Sites',
            value: 890,
            percentage: 42.4,
            color: 'rgb(34, 197, 94)'
          },
          'review-sites': {
            name: 'Review Sites',
            value: 650,
            percentage: 31.0,
            color: 'rgb(59, 130, 246)'
          },
          'blogs': {
            name: 'Blogs & Media',
            value: 560,
            percentage: 26.7,
            color: 'rgb(168, 85, 247)'
          }
        }
      }
    }
  }
  
  if (isWebsite) {
    return {
      'organic-search': {
        name: 'Organic Search',
        value: 8900,
        percentage: 42.1,
        color: 'rgb(34, 197, 94)',
        children: {
          'google': {
            name: 'Google',
            value: 7300,
            percentage: 82.0,
            color: 'rgb(34, 197, 94)'
          },
          'bing': {
            name: 'Bing',
            value: 980,
            percentage: 11.0,
            color: 'rgb(59, 130, 246)'
          },
          'yahoo': {
            name: 'Yahoo',
            value: 420,
            percentage: 4.7,
            color: 'rgb(168, 85, 247)'
          },
          'duckduckgo': {
            name: 'DuckDuckGo',
            value: 200,
            percentage: 2.2,
            color: 'rgb(251, 191, 36)'
          }
        }
      },
      'direct': {
        name: 'Direct',
        value: 4200,
        percentage: 19.9,
        color: 'rgb(251, 191, 36)',
        children: {
          'direct-type': {
            name: 'Direct Type',
            value: 2800,
            percentage: 66.7,
            color: 'rgb(251, 191, 36)'
          },
          'bookmarks': {
            name: 'Bookmarks',
            value: 1050,
            percentage: 25.0,
            color: 'rgb(34, 197, 94)'
          },
          'mobile-app': {
            name: 'Mobile App',
            value: 350,
            percentage: 8.3,
            color: 'rgb(59, 130, 246)'
          }
        }
      },
      'social-media': {
        name: 'Social Media',
        value: 3100,
        percentage: 14.7,
        color: 'rgb(168, 85, 247)',
        children: {
          'linkedin': {
            name: 'LinkedIn',
            value: 1240,
            percentage: 40.0,
            color: 'rgb(59, 130, 246)'
          },
          'twitter': {
            name: 'Twitter/X',
            value: 930,
            percentage: 30.0,
            color: 'rgb(0, 0, 0)'
          },
          'facebook': {
            name: 'Facebook',
            value: 620,
            percentage: 20.0,
            color: 'rgb(59, 130, 246)'
          },
          'reddit': {
            name: 'Reddit',
            value: 310,
            percentage: 10.0,
            color: 'rgb(239, 68, 68)'
          }
        }
      },
      'referral': {
        name: 'Referral',
        value: 2100,
        percentage: 9.9,
        color: 'rgb(34, 197, 94)',
        children: {
          'industry-blogs': {
            name: 'Industry Blogs',
            value: 980,
            percentage: 46.7,
            color: 'rgb(34, 197, 94)'
          },
          'news-sites': {
            name: 'News Sites',
            value: 630,
            percentage: 30.0,
            color: 'rgb(59, 130, 246)'
          },
          'partner-links': {
            name: 'Partner Links',
            value: 490,
            percentage: 23.3,
            color: 'rgb(168, 85, 247)'
          }
        }
      },
      'email': {
        name: 'Email',
        value: 1800,
        percentage: 8.5,
        color: 'rgb(239, 68, 68)',
        children: {
          'newsletters': {
            name: 'Newsletters',
            value: 1080,
            percentage: 60.0,
            color: 'rgb(34, 197, 94)'
          },
          'marketing': {
            name: 'Marketing Emails',
            value: 540,
            percentage: 30.0,
            color: 'rgb(59, 130, 246)'
          },
          'notifications': {
            name: 'Notifications',
            value: 180,
            percentage: 10.0,
            color: 'rgb(168, 85, 247)'
          }
        }
      },
      'paid-search': {
        name: 'Paid Search',
        value: 1200,
        percentage: 5.7,
        color: 'rgb(59, 130, 246)',
        children: {
          'google-ads': {
            name: 'Google Ads',
            value: 960,
            percentage: 80.0,
            color: 'rgb(34, 197, 94)'
          },
          'bing-ads': {
            name: 'Bing Ads',
            value: 240,
            percentage: 20.0,
            color: 'rgb(59, 130, 246)'
          }
        }
      }
    }
  }
  
  // Default demo data
  return {
    'demo-traffic': {
      name: 'Demo Traffic',
      value: 2800,
      percentage: 50.0,
      color: 'rgb(59, 130, 246)'
    },
    'sample-direct': {
      name: 'Sample Direct',
      value: 1600,
      percentage: 28.6,
      color: 'rgb(34, 197, 94)'
    },
    'test-social': {
      name: 'Test Social',
      value: 900,
      percentage: 16.1,
      color: 'rgb(168, 85, 247)'
    },
    'example-referral': {
      name: 'Example Referral',
      value: 534,
      percentage: 9.5,
      color: 'rgb(251, 191, 36)'
    }
  }
}

export const getAvailableKpiCards = () => {
  return [
    {
      id: 'total-users',
      name: 'Total Users',
      icon: '👥',
      color: 'blue',
      enabled: true,
      type: 'standard'
    },
    {
      id: 'sessions',
      name: 'Sessions',
      icon: '📊',
      color: 'green',
      enabled: true,
      type: 'standard'
    },
    {
      id: 'page-views',
      name: 'Page Views',
      icon: '📈',
      color: 'purple',
      enabled: true,
      type: 'standard'
    },
    {
      id: 'avg-session',
      name: 'Avg. Session',
      icon: '⏱️',
      color: 'orange',
      enabled: true,
      type: 'standard'
    },
    {
      id: 'bounce-rate',
      name: 'Bounce Rate',
      icon: '⚡',
      color: 'red',
      enabled: false,
      type: 'standard'
    },
    {
      id: 'conversion-rate',
      name: 'Conversion Rate',
      icon: '🎯',
      color: 'green',
      enabled: false,
      type: 'standard'
    },
    {
      id: 'revenue',
      name: 'Revenue',
      icon: '💰',
      color: 'green',
      enabled: true,
      type: 'revenue'
    },
    {
      id: 'goals',
      name: 'Goals & Objectives',
      icon: '🎯',
      color: 'purple',
      enabled: true,
      type: 'goals'
    },
    {
      id: 'events',
      name: 'User Events',
      icon: '⭐',
      color: 'orange',
      enabled: true,
      type: 'events'
    },
    {
      id: 'realtime',
      name: 'Real-time Users',
      icon: '🔴',
      color: 'red',
      enabled: true,
      type: 'enhanced'
    },
    {
      id: 'new-users',
      name: 'New Users',
      icon: '🆕',
      color: 'blue',
      enabled: false,
      type: 'enhanced'
    },
    {
      id: 'returning-users',
      name: 'Returning Users',
      icon: '🔄',
      color: 'green',
      enabled: false,
      type: 'enhanced'
    }
  ]
}