import React, { useState } from 'react'
import { Tooltip } from '@heroui/react'

function SidebarTooltip(props:{  children: React.ReactNode,label:string }) {

  const [tootlip, setTootlip] = useState(false)


  return (
    <Tooltip
      content={props.label}
      delay={200}
      placement="left"
      showArrow
      color="primary"
      isOpen={tootlip}
      onOpenChange={(open) => setTootlip(open)}
    >
      {props.children}
    </Tooltip>
  )
}

export default SidebarTooltip