import { Table, flexRender } from "@tanstack/react-table";
import classNames from "classnames";

interface TanstackTableProps<T> {
  table: Table<T>;
}

export const TanstackTable = <T,>({ table }: TanstackTableProps<T>) => {
  return (
    <table className='tw-w-full'>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th
                key={header.id}
                className={classNames(
                  "tw-border-b tw-border-rgba-white-10 tw-pb-2 tw-text-left tw-font-roboto tw-text-xs tw-font-medium tw-text-ithaca-white-60"
                )}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id} className='tw-border-t tw-border-rgba-white-10'>
            {row.getVisibleCells().map(cell => (
              <td className={classNames("tw-py-4")} key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
