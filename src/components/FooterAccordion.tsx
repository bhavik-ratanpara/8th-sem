'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { FooterAccountLinks } from './FooterAccountLinks'

type AccordionItemProps = {
  title: string
  children: React.ReactNode
}

function AccordionItem({ 
  title, 
  children 
}: AccordionItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full flex items-center 
          justify-between
          py-3 px-0
          text-left
        "
      >
        <span className="
          text-xs font-semibold
          uppercase tracking-wider
          text-muted-foreground
        ">
          {title}
        </span>
        <ChevronDown
          className="
            h-4 w-4 text-muted-foreground
            transition-transform duration-200
          "
          style={{
            transform: open 
              ? 'rotate(180deg)' 
              : 'rotate(0deg)'
          }}
        />
      </button>

      <div
        style={{
          maxHeight: open ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div className="pb-4 space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export function FooterAccordion() {
  return (
    <div className="md:hidden px-6 pt-2 pb-4">

      {/* Resources */}
      <AccordionItem title="Resources">
        {[
          { label: 'Guide', href: '/guide' },
          { label: 'About', href: '/about' },
        ].map((link) => (
          <div key={link.href}>
            <Link
              href={link.href}
              className="
                text-sm text-muted-foreground
                hover:text-foreground
                transition-colors duration-200
                block
              "
            >
              {link.label}
            </Link>
          </div>
        ))}
      </AccordionItem>

      {/* Legal */}
      <AccordionItem title="Legal">
        <div>
          <Link
            href="/privacy"
            className="
              text-sm text-muted-foreground
              hover:text-foreground
              transition-colors duration-200
              block
            "
          >
            Privacy Policy
          </Link>
        </div>
        <div>
          <Link
            href="/terms"
            className="
              text-sm text-muted-foreground
              hover:text-foreground
              transition-colors duration-200
              block
            "
          >
            Terms of Service
          </Link>
        </div>
      </AccordionItem>

    </div>
  )
}
