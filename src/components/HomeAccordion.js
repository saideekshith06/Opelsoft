'use client';

import { useState } from 'react';

const SERVICES_DATA = [
  {
    id: 1,
    title: 'AI Services',
    links: [
      { name: 'Generative AI Services', href: '/jobs?industry=Technology' },
      { name: 'Agentic AI & Automation', href: '/dashboard/candidate' },
      { name: 'Traditional AI Solutions', href: '/jobs?industry=Technology' },
      { name: 'AI Engineering & Platforms', href: '/jobs?industry=Technology' },
      { name: 'AI Governance & Risk', href: '/jobs?industry=Technology' },
      { name: 'Data Engineering for AI', href: '/jobs?industry=Technology' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    alt: 'AI and Machine Learning Center of Excellence'
  },
  {
    id: 2,
    title: 'Product Engineering',
    links: [
      { name: 'Digital Application Development', href: '/jobs?industry=Technology' },
      { name: 'Mobile Engineering', href: '/jobs?industry=Technology' },
      { name: 'IoT & Wearables Solutions', href: '/jobs?industry=Technology' },
      { name: 'Quality Engineering & Automation', href: '/jobs?industry=Technology' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    alt: 'Product Engineering and Software Development'
  },
  {
    id: 3,
    title: 'Digital Experience',
    links: [
      { name: 'Product Strategy & Consulting', href: '/jobs?industry=Management' },
      { name: 'Product Design', href: '/jobs?industry=Creative' },
      { name: 'Product Management', href: '/jobs?industry=Management' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80',
    alt: 'Digital Experience and UI UX Design'
  },
  {
    id: 4,
    title: 'ServiceNow',
    links: [
      { name: 'AI Solutions for ITOM', href: '/jobs?industry=Technology' },
      { name: 'Implementation Services', href: '/jobs?industry=Technology' },
      { name: 'Optimization Services', href: '/jobs?industry=Technology' },
      { name: 'Consulting Services', href: '/jobs?industry=Technology' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    alt: 'ServiceNow Cloud Management Solutions'
  },
  {
    id: 5,
    title: 'SAP Services',
    links: [
      { name: 'S/4HANA Implementations', href: '/jobs?industry=Finance' },
      { name: 'SAP AMS Support', href: '/jobs?industry=Finance' },
      { name: 'SAP Automation & Security', href: '/jobs?industry=Finance' },
      { name: 'SAP Value Added Solutions', href: '/jobs?industry=Finance' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    alt: 'SAP Enterprise ERP systems'
  },
  {
    id: 6,
    title: 'Data & Analytics',
    links: [
      { name: 'Data Consulting', href: '/jobs?industry=Technology' },
      { name: 'Data Migration & Modernization', href: '/jobs?industry=Technology' },
      { name: 'Analytics Services', href: '/jobs?industry=Technology' },
      { name: 'Integration & APIs', href: '/jobs?industry=Technology' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    alt: 'Big Data Consulting and Advanced Business Intelligence'
  }
];

export default function HomeAccordion() {
  const [activeId, setActiveId] = useState(1);

  const activeService = SERVICES_DATA.find(s => s.id === activeId) || SERVICES_DATA[0];

  return (
    <div className="accordion-wrap">
      <div className="accordion-text">
        {SERVICES_DATA.map((service) => {
          const isActive = service.id === activeId;
          return (
            <div key={service.id}>
              <div 
                className={`accordion ${isActive ? 'active' : ''}`}
                onClick={() => setActiveId(service.id)}
              >
                {service.title}
              </div>
              <div className={`panel ${isActive ? 'visible' : ''}`}>
                {service.links.map((link, index) => (
                  <a key={index} href={link.href}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="accordion-images mob-hide">
        {SERVICES_DATA.map((service) => (
          <img 
            key={service.id}
            src={service.imageUrl}
            alt={service.alt}
            className={service.id === activeId ? 'show' : ''}
          />
        ))}
      </div>
    </div>
  );
}
