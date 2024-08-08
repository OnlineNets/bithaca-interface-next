import { SingleAccountManagementKey } from "@/types/accessManagement";
import { RowData, createColumnHelper } from "@tanstack/react-table";
import Button from "@/UI/components/Button/Button";
import { maskString } from "@/UI/utils/Text";

// Extend the TableMeta interface without causing conflicts
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    handleRevoke: (data: SingleAccountManagementKey) => void;
    delegateWallet: () => void;
    regenerateApiKey: () => void;
    revokeAll: () => void;
  }
}

const columnHelper = createColumnHelper<SingleAccountManagementKey>();

export const accessManagementColumns = [
  columnHelper.accessor("type", {
    header: () => <div className='tw-text-left'>Type</div>,
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("address", {
    cell: info => {
      const handleCopy = () => {
        navigator.clipboard.writeText(info.getValue());
      };
      return (
        <div className='tw-flex tw-gap-5'>
          <p className='tw-line-clamp-1 tw-w-[400px]'>{maskString(info.getValue())}</p>
          <button
            title='Click to unlink API key'
            className={"tw-font-roboto tw-text-xs tw-font-bold tw-text-ithaca-green-30"}
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
      );
    },
    header: () => "Wallet Address / API Key",
  }),
  columnHelper.display({
    id: "actionButtons",
    cell: info => (
      <div className='tw-flex tw-justify-end'>
        <button
          title='Click to unlink API key'
          className={"tw-text-xs tw-text-ithaca-red-20"}
          onClick={() => {
            info.table.options.meta?.handleRevoke(info.row.original);
          }}
        >
          Revoke
        </button>
      </div>
    ),
    header: data => {
      const { table } = data;
      return (
        <div className='tw-flex tw-justify-end tw-gap-6 tw-self-end'>
          <Button title='Click to Delegate Wallet' size='sm' onClick={table.options.meta?.delegateWallet}>
            Delegate Wallet
          </Button>
          <Button title='Click to regenerate api' size='sm' onClick={table.options.meta?.regenerateApiKey}>
            Regenerate API
          </Button>
          <button
            title='Click to unlink API key'
            className={"tw-text-xs tw-text-ithaca-red-20"}
            onClick={table.options.meta?.revokeAll}
          >
            Revoke All
          </button>
        </div>
      );
    },
  }),
];
