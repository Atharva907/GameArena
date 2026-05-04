'use client'

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

const ThemeSwitch = () => {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='icon'
          className='size-8 rounded-lg border-border/80 bg-background text-muted-foreground'
          aria-label='Change theme'
        >
          <IoSunnyOutline className='dark:hidden' />
          <IoMoonOutline className='hidden dark:block' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='rounded-lg p-1'>
        <DropdownMenuItem className='text-[13px]' onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem className='text-[13px]' onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem className='text-[13px]' onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeSwitch
