import Link from "next/link";

type Option = {
  id: number;
  nome?: string;
  arc?: string;
  nome_db_origine?: string;
};

type Props = {
  tipologie: Option[];
  archivi: Option[];
  fonti: Option[];
  testate: Option[];
  anni: number[];
  values: {
    tipologia: string;
    archivio: string;
    fonte: string;
    testata: string;
    anno: string;
  };
};

function SelectFilter({
  name,
  label,
  value,
  options,
  getLabel,
}: {
  name: string;
  label: string;
  value: string;
  options: Option[] | number[];
  getLabel: (item: Option | number) => string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-paper/60"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue={value}
        className="h-11 w-full border border-paper/20 bg-forest-800 px-3 text-xs text-paper outline-none transition focus:border-ochre-400/60"
      >
        <option value="">Tutti</option>

        {options.map((item) => {
          const optionValue =
            typeof item === "number" ? String(item) : String(item.id);

          return (
            <option key={optionValue} value={optionValue}>
              {getLabel(item)}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default function FiltriArchivio({
  tipologie,
  archivi,
  fonti,
  testate,
  anni,
  values,
}: Props) {
  return (
    <div className="border border-paper/25 bg-forest-700 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-paper/65">
          Filtri
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SelectFilter
          name="tipologia"
          label="Tipologia"
          value={values.tipologia}
          options={tipologie}
          getLabel={(item) =>
            typeof item === "number" ? String(item) : item.nome || ""
          }
        />

        <SelectFilter
          name="archivio"
          label="Archivio"
          value={values.archivio}
          options={archivi}
          getLabel={(item) =>
            typeof item === "number" ? String(item) : item.arc || ""
          }
        />

        <SelectFilter
          name="fonte"
          label="Fonte / database"
          value={values.fonte}
          options={fonti}
          getLabel={(item) =>
            typeof item === "number" ? String(item) : item.nome_db_origine || ""
          }
        />

        <SelectFilter
          name="testata"
          label="Testata"
          value={values.testata}
          options={testate}
          getLabel={(item) =>
            typeof item === "number" ? String(item) : item.nome || ""
          }
        />

        <SelectFilter
          name="anno"
          label="Anno"
          value={values.anno}
          options={anni}
          getLabel={(item) => String(item)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="border border-ochre-400/50 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-400 transition hover:bg-ochre-400 hover:text-forest-950"
        >
          Applica filtri
        </button>

        <Link
          href="/archivio/esplora"
          className="border border-bordeaux-500 bg-bordeaux-500/15 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-bordeaux-400 transition hover:bg-bordeaux-500 hover:text-paper"
        >
          ✕ Azzera tutto
        </Link>
      </div>
    </div>
  );
}