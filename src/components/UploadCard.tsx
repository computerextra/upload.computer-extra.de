import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const passwordCharacters = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  special: "!@#$%&?*",
};

function secureRandomIndex(length: number) {
  const maximum = Math.floor(256 / length) * length;
  const randomValue = new Uint8Array(1);

  do {
    crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= maximum);

  return randomValue[0] % length;
}

function generateSecurePassword(length = 20) {
  const characterGroups = Object.values(passwordCharacters);
  const allCharacters = characterGroups.join("");
  const password = characterGroups.map(
    (characters) => characters[secureRandomIndex(characters.length)],
  );

  while (password.length < length) {
    password.push(allCharacters[secureRandomIndex(allCharacters.length)]);
  }

  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [password[index], password[swapIndex]] = [
      password[swapIndex],
      password[index],
    ];
  }

  return password.join("");
}

export default function UploadCard() {
  return (
    <Card>
      <CardTitle>Datei Hochladen</CardTitle>
      <CardDescription>
        <p className="leading-7 not-first:mt-6">
          Hier können Sie eine Datei bis maximal 20MB sicher Hochladen. Die
          Datei wird verschlüsselt und sicher auf unserem Server gespeichert.
        </p>
        <b>Wichtige Hinweise:</b>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li className="text-black font-semibold">
            Wir erhalten keine Information über Dateien, die Sie über diese
            Platform hochladen. Falls Sie die Datei für einen Mitarbeiter von
            uns Hochladen sollten, wenden Sie sich nach dem erfolgreichen
            Hochladen bitte an Ihren Ansprechpartner bei uns im Haus. Teilen Sie
            ihm den Fingerabdruck mit beziehungsweise schicken Sie diesen per
            E-Mail. Teilen Sie Ihrem Ansprechpartner im Anschluss das Passwort
            für den Download der Datei mit.
          </li>
          <li>
            Sie erhalten nach dem erfolgreichen Hochladen den Fingerabdruck der
            Datei, ohne diesen Wert kann die Datei nicht heruntergeladen werden.
          </li>
          <li>
            Bitte bewahren Sie das gesetzte Passwort sicher auf, ohne das
            Passwort kann die Datei nicht heruntergeladen werden. Ein
            Zurücksetzen des Passworts ist nicht möglich.
          </li>
          <li>
            Die Datei wird automatisch nach 30 Tagen gelöscht. Sie können die
            Datei vorzeitig löschen, indem Sie den Fingerabdruck eingeben und
            den Löschen-Button drücken.
          </li>
        </ul>
      </CardDescription>
      <CardContent>
        <UploadForm />
      </CardContent>
    </Card>
  );
}

const fileSizeLimit = 50 * 1024 * 1024; // 50 MB

const formSchema = z.object({
  password: z
    .string("Ein Passwort muss eingegeben werden")
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Das Passwort muss mindestens 1 Großbuchstaben enthalten",
    )
    .refine(
      (password) => /[a-z]/.test(password),
      "Das Passwort muss mindestens 1 Kleinbuchstaben enthalten",
    )
    .refine(
      (password) => /[0-9]/.test(password),
      "Das Passwort muss mindestens 1 Zahl enthalten",
    )
    .refine(
      (passord) => /[!@#$%&?*]/.test(passord),
      "Das Passwort muss mindestens 1 Sonderzeichen enthalten, zugelassene Sonderzeichen: '!@#$%&?*'",
    ),
  file: z
    .file()
    .refine(
      (file) => file.size <= fileSizeLimit,
      "Die Datei darf nicht größer als 20MB sein.",
    ),
});

function UploadForm() {
  const [initialPassword] = useState(generateSecurePassword);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const form = useForm({
    defaultValues: {
      file: {} as File,
      password: initialPassword,
    },
    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <form
      id="upload-form"
      action="https://api.computer-extra.de/files/upload.php"
      method="POST"
      encType="multipart/form-data"
    >
      <FieldGroup>
        <form.Field
          name="file"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Datei</FieldLabel>
                <Input
                  required
                  type="file"
                  id={field.name}
                  name={field.name}
                  value={field.state.value.name}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.files ? e.target.files[0] : ({} as File),
                    )
                  }
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            const copyPassword = async () => {
              if (!field.state.value) return;

              try {
                await navigator.clipboard.writeText(field.state.value);
                setPasswordCopied(true);
                toast.success("Passwort wurde kopiert.");
                window.setTimeout(() => setPasswordCopied(false), 2000);
              } catch {
                toast.error("Passwort konnte nicht kopiert werden.");
              }
            };

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Passwort</FieldLabel>
                <div className="flex min-w-0">
                  <Input
                    required
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      setPasswordCopied(false);
                      field.handleChange(e.target.value);
                    }}
                    aria-invalid={isInvalid}
                    placeholder="Passwort"
                    autoComplete="new-password"
                    className="min-w-0 rounded-r-none font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-none border-l-0"
                    disabled={!field.state.value}
                    onClick={copyPassword}
                    aria-label="Passwort kopieren"
                    title="Passwort kopieren"
                  >
                    {passwordCopied ? <Check /> : <Copy />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-l-none border-l-0"
                    onClick={() => {
                      setPasswordCopied(false);
                      field.handleChange(generateSecurePassword());
                    }}
                    aria-label="Sicheres Passwort erzeugen"
                    title="Sicheres Passwort erzeugen"
                  >
                    <RefreshCw />
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  Das Passwort wird sichtbar angezeigt und kann direkt kopiert
                  werden.
                </p>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <Button type="submit" form="upload-form">
          Datei hochladen
        </Button>
      </FieldGroup>
    </form>
  );
}
