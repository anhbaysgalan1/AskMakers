import React from 'react'
import { NextPage } from 'next'

const Input: NextPage<Props> = props => {
  const { type, value, handleChange, label, placeholder, id, requied } = props
  return (
    <>
      {label !== undefined && requied === undefined &&
        <label className="font-semibold mb-2 block" htmlFor={id}>
          {label}
        </label>
      }
      {label !== undefined && requied !== undefined &&
        <label className="font-semibold mb-2 block" htmlFor={id}>
          <span className="text-red-400">*</span>
          {label}
        </label>
      }
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="w-full border-2 rounded px-3 py-1 border-gray-400 focus:border-gray-500 focus:outline-none"
      />
    </>
  )
}

interface Props {
  value: string,
  id: string,
  handleChange: any,
  type: string,
  label?: string,
  placeholder?: string,
  requied?: boolean
}

export default Input
